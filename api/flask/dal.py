from datetime import datetime
from models import Label, LabeledText, Classifier
import pickle

# Create the database tables if they don't already exist
import database
database.init_db()

# http://docs.sqlalchemy.org/en/latest/orm/session_api.html
# http://docs.sqlalchemy.org/en/latest/orm/query.html

def get_label_id(session, uid, label_text):
    """
    Get the id of the label with the given label text from the database. Adds a
    new label for the given label text to the database if it's not already
    there.
    """
    label = session.query(Label).filter_by(uid=uid, label=label_text).first()
    if not label:
        session.add(Label(uid=uid, label=label_text))
        session.commit()
        label = session.query(Label).filter_by(uid=uid, label=label_text).first()
    return label.id

def get_label_text(session, uid, label_id):
    """
    Get the text of the label with the given label id from the database.
    """
    label = session.query(Label).filter_by(uid=uid, id=label_id).first()
    if not label:
        return None
    return label.label

def add_labeled_text(session, uid, label_text, text):
    """
    Adds the given text to the database for a user, labeled with the given
    label text.
    """
    session.query(LabeledText).filter_by(uid=uid, text=text).delete(synchronize_session='fetch')
    label_id = get_label_id(session, uid, label_text)
    labeled_text = LabeledText(timestamp=datetime.now(), uid=uid, label=label_id, text=text)
    session.add(labeled_text)

def get_id_labeled_text(session, uid):
    """
    Get a dictionary of all the given user's labeled text. Training data
    (labeled text) is in the 'data' key and training targets (label ids) are in
    the 'targets' key.
    """
    all_labeled_text = session.query(LabeledText).filter_by(uid=uid)
    data = [labeled_text.text for labeled_text in all_labeled_text]
    target_ids = [labeled_text.label for labeled_text in all_labeled_text]
    return {'data': data, 'targets': target_ids}

def get_text_labeled_text(session, uid):
    """
    Get a dictionary of all the given user's labeled text. Training data
    (labeled text) is in the 'data' key and training targets (label texts) are in
    the 'targets' key.
    """
    all_labeled_text = session.query(LabeledText).filter_by(uid=uid)
    data = [labeled_text.text for labeled_text in all_labeled_text]
    target_ids = [labeled_text.label for labeled_text in all_labeled_text]
    targets = [get_label_text(session, uid, id) for id in target_ids]
    return {'data': data, 'targets': targets}

def get_labels(session, uid):
    """
    Get a list of all the given user's labels.
    """
    return [db_label.label for db_label in session.query(Label).filter_by(uid=uid)]

def populate(session, uid):
    """
    Populates the database for the given user with sample data.
    """
    delete(session, uid)
    add_labeled_text(session, uid, 'harmless', 'hello')
    add_labeled_text(session, uid, 'harmless', 'world')
    add_labeled_text(session, uid, 'harmless', 'smile')
    add_labeled_text(session, uid, 'hateful', 'the')
    add_labeled_text(session, uid, 'hateful', 'news')
    add_labeled_text(session, uid, 'hateful', 'scrub')
    add_labeled_text(session, uid, 'christmas', 'trees')
    add_labeled_text(session, uid, 'christmas', 'santa')
    add_labeled_text(session, uid, 'christmas', 'snow')
    add_labeled_text(session, uid, 'awesome', 'virginia')
    add_labeled_text(session, uid, 'awesome', 'tech')
    add_labeled_text(session, uid, 'awesome', 'hokies')

def delete(session, uid):
    """
    Deletes all of the user's data from the database.
    """
    session.query(LabeledText).filter_by(uid=uid).delete(synchronize_session='fetch')
    session.query(Label).filter_by(uid=uid).delete(synchronize_session='fetch')
    session.query(Classifier).filter_by(uid=uid).delete(synchronize_session='fetch')

def update_classifier(session, uid, model):
    """
    Persists the user's classifier to the database.
    """
    classifier = Classifier(timestamp=datetime.now(), uid=uid, model=model)
    session.query(Classifier).filter_by(uid=uid).delete(synchronize_session='fetch')
    session.add(classifier)

def get_classifier(session, uid):
    """
    Gets the user's binary classifier blob from the database.
    """
    classifier = session.query(Classifier).filter_by(uid=uid).first()
    if not classifier:
        return None
    return classifier.model

def get_stats(session, uid):
    """
    Gets the user's stats.
    """
    freq_dist = {}
    label_count = session.query(Label).filter_by(uid=uid).count()
    labeled_text_count = session.query(LabeledText).filter_by(uid=uid).count()
    classifier = session.query(Classifier).filter_by(uid=uid).first()
    classifier_timestamp = None if not classifier else classifier.timestamp
    for db_label in session.query(Label).filter_by(uid=uid):
        frequency = session.query(LabeledText).filter_by(uid=uid,label=db_label.id).count()
        freq_dist[db_label.label] = frequency
    stats = {
        'label_count': label_count,
        'labeled_text_count': labeled_text_count,
        'freq_dist': freq_dist,
        'classifier_timestamp': str(classifier_timestamp)
    }
    return stats
