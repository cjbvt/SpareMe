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
        # TODO fit multiple classifiers so we can pick the best one
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

def reingest(session, uid, unlabeled_text, predictions):
    t = Thread(target=reingest_thread, args=(session, uid, unlabeled_text, predictions))
    t.start()

def reingest_thread(session, uid, unlabeled_text, predictions):
    args = {
        'session': session,
        'uid': uid,
        'unlabeled_text': unlabeled_text,
        'predictions': predictions
    }
    p.map(reingest_process, [args])

def reingest_process(args):
    session = args['session']
    uid = args['uid']
    unlabeled_text = args['unlabeled_text']
    predictions = args['predictions']

    # create a new temporary model file
    fd, path = tempfile.mkstemp()

    # close the temporary model file descriptor as we don't need it
    os.close(fd)

    # give this process a dedicated session
    session = Session()
    try:
        # check for any exact matches in the db and return those labels regardless of which were predicted.
        for i, unlabeled_item in enumerate(unlabeled_text):
            label_id = dal.get_label_id_for_labeled_text(session, uid, unlabeled_item)
            if label_id:
                predictions[i] = dal.get_label_text(session, uid, label_id)

        # assume any text predicted to be harmless is actually harmless and reingest it for training.
        for unlabeled_item, predicted_label in zip(unlabeled_text, predictions):
            if predicted_label == 'harmless':
                dal.add_labeled_text(session, uid, predicted_label, unlabeled_item)

        # in case text was reingested, rebuild model to take it into account
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

def predict(session, uid, unlabeled_text):
    """
    Predicts the text label of every value in the given list of unlabeled text.
    """
    classifier = dal.get_classifier(session, uid)
    if not classifier:
        print('classifier not found; assuming harmless')
        return ['harmless' for _ in unlabeled_text]

    # create a new temporary model file
    fd, path = tempfile.mkstemp()

    # close the temporary model file descriptor as we don't need it
    os.close(fd)

    # write out model to the the temporary model file
    with open(path, 'wb') as f:
        f.write(classifier)

    # TODO compare the quality of all classifiers and use the best one
    predictions = ftclassifier.predict(session, uid, path, unlabeled_text)
    # predictions = sgdclassifier.predict(session, uid, path, unlabeled_text)
    
    # delete the temporary model file
    os.unlink(path)

    reingest(session, uid, unlabeled_text, predictions)

    return predictions
