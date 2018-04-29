from threading import Thread
from multiprocessing import Pool
import os
import tempfile

from database import Session
import dal
import ftclassifier
# import sgdclassifier

def fit_process(uid):
    # create a new temporary model file
    fd, path = tempfile.mkstemp()

    # close the temporary model file descriptor as we don't need it
    os.close(fd)

    # give this process a dedicated session
    session = Session()
    try:
        ftclassifier.fit(session, uid, path)
        # sgdclassifier.fit(session, uid, path)

        # persist the model to the database
        with open(path, 'rb') as f:
            classifier = f.read()
            dal.update_classifier(session, uid, classifier)

        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()
        Session.remove()

    # delete the temporary model file
    os.unlink(path)

p = Pool(1)
def fit_thread(uid):
    """
    Asynchronously spawns a subprocess which fits a new classifier.
    """
    p.map(fit_process, [uid])

def fit(uid):
    """
    Asynchronously spawns a thread which spawns a subprocess which
    fits a new classifier from the given user's labeled text in the
    database. We can't just do this in a thread because the fit
    operation uses multiprocessing and so must be done on the main
    thread. And we can't just spawn a process because we have to
    immediately join() it in order to avoid creating zombies. So we
    spawn a thread whose only responsibility is spawning and joining
    the process.
    """
    t = Thread(target=fit_thread, args=(uid,))
    t.start()

def predict(session, uid, unlabeled_text):
    """
    Predicts the text label of every value in the given list of unlabeled text.
    """
    classifier = dal.get_classifier(session, uid)
    if not classifier:
        return ['harmless' for _ in unlabeled_text]

    # create a new temporary model file
    fd, path = tempfile.mkstemp()

    # close the temporary model file descriptor as we don't need it
    os.close(fd)

    # write out model to the the temporary model file
    with open(path, 'wb') as f:
        f.write(classifier)

    predictions = ftclassifier.predict(uid, path, unlabeled_text)
    # predictions = sgdclassifier.predict(session, uid, path, unlabeled_text)
    
    # delete the temporary model file
    os.unlink(path)

    return predictions
