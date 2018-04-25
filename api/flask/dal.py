from datetime import datetime
from models import Label, LabeledText, Classifier
from database import db_session
import pickle

# Create the database tables if they don't already exist
import database
database.init_db()

# http://docs.sqlalchemy.org/en/latest/orm/session_api.html
# http://docs.sqlalchemy.org/en/latest/orm/query.html

def get_label_id(uid, label_text):
    """
    Get the id of the label with the given label text from the database. Adds a
    new label for the given label text to the database if it's not already
    there.
    """
    label = db_session.query(Label).filter_by(uid=uid, label=label_text).first()
    if not label:
        db_session.add(Label(uid=uid, label=label_text))
        db_session.commit()
        label = db_session.query(Label).filter_by(uid=uid, label=label_text).first()
    return label.id

def get_label_text(uid, label_id):
    """
    Get the text of the label with the given label id from the database.
    """
    label = db_session.query(Label).filter_by(uid=uid, id=label_id).first()
    if not label:
        return None
    return label.label

def add_labeled_text(uid, label_text, text):
    """
    Adds the given text to the database for a user, labeled with the given
    label text.
    """
    db_session.query(LabeledText).filter_by(uid=uid, text=text).delete()
    label_id = get_label_id(uid, label_text)
    labeled_text = LabeledText(timestamp=datetime.now(), uid=uid, label=label_id, text=text)
    db_session.add(labeled_text)
    db_session.commit()

def get_id_labeled_text(uid):
    """
    Get a dictionary of all the given user's labeled text. Training data
    (labeled text) is in the 'data' key and training targets (label ids) are in
    the 'targets' key.
    """
    all_labeled_text = db_session.query(LabeledText).filter_by(uid=uid)
    data = [labeled_text.text for labeled_text in all_labeled_text]
    target_ids = [labeled_text.label for labeled_text in all_labeled_text]
    return {'data': data, 'targets': target_ids}

def get_text_labeled_text(uid):
    """
    Get a dictionary of all the given user's labeled text. Training data
    (labeled text) is in the 'data' key and training targets (label texts) are in
    the 'targets' key.
    """
    all_labeled_text = db_session.query(LabeledText).filter_by(uid=uid)
    data = [labeled_text.text for labeled_text in all_labeled_text]
    target_ids = [labeled_text.label for labeled_text in all_labeled_text]
    targets = [get_label_text(uid, id) for id in target_ids]
    return {'data': data, 'targets': targets}

def get_labels(uid):
    """
    Get a list of all the given user's labels.
    """
    return [db_label.label for db_label in db_session.query(Label).filter_by(uid=uid)]

def populate(uid):
    """
    Populates the database for the given user with sample data.
    """
    delete(uid)
    add_labeled_text(uid, 'harmless', 'hello')
    add_labeled_text(uid, 'harmless', 'world')
    add_labeled_text(uid, 'harmless', 'smile')
    add_labeled_text(uid, 'hateful', 'the')
    add_labeled_text(uid, 'hateful', 'news')
    add_labeled_text(uid, 'hateful', 'scrub')
    add_labeled_text(uid, 'christmas', 'trees')
    add_labeled_text(uid, 'christmas', 'santa')
    add_labeled_text(uid, 'christmas', 'snow')
    add_labeled_text(uid, 'awesome', 'virginia')
    add_labeled_text(uid, 'awesome', 'tech')
    add_labeled_text(uid, 'awesome', 'hokies')

def delete(uid):
    """
    Deletes all of the user's data from the database.
    """
    db_session.query(LabeledText).filter_by(uid=uid).delete()
    db_session.query(Label).filter_by(uid=uid).delete()
    db_session.query(Classifier).filter_by(uid=uid).delete()
    db_session.commit()

def update_classifier(uid, model):
    """
    Persists the user's classifier to the database.
    """
    classifier = Classifier(timestamp=datetime.now(), uid=uid, model=model)
    db_session.query(Classifier).filter_by(uid=uid).delete()
    db_session.add(classifier)
    db_session.commit()

def get_classifier(uid):
    """
    Gets the user's binary classifier blob from the database.
    """
    classifier = db_session.query(Classifier).filter_by(uid=uid).first()
    if not classifier:
        return None
    return classifier.model
