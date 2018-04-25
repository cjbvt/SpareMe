from threading import Thread
from multiprocessing import Process
import os
import tempfile

import dal
import ftclassifier
# import sgdclassifier

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

def fit_thread(uid):
    """
    Asynchronously spawns a subprocess which fits a new classifier.
    """
    p = Process(target=fit_process, args=(uid,))
    p.start()
    p.join()

def fit_process(uid):
    # create a new temporary model file
    fd, path = tempfile.mkstemp()

    # close the temporary model file descriptor as we don't need it
    os.close(fd)

    ftclassifier.fit(uid, path)
    # sgdclassifier.fit(uid, path)

    # persist the model to the database
    with open(path, 'rb') as f:
        classifier = f.read()
        dal.update_classifier(uid, classifier)

    # delete the temporary model file
    os.unlink(path)

def predict(uid, unlabeled_text):
    """
    Predicts the text label of every value in the given list of unlabeled text.
    """
    classifier = dal.get_classifier(uid)
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
    # predictions = sgdclassifier.predict(uid, path, unlabeled_text)
    
    # delete the temporary model file
    os.unlink(path)

    return predictions
