import os

from flask import Flask
from flask import request
from flask_api import status
from flask_restful import Resource, Api
import json

import firebase_admin
from firebase_admin import auth, credentials

from database import Session

import dal
import classifier

# initialize the firebase server/admin SDK
cred = credentials.Certificate('firebase-private-key.json')
default_app = firebase_admin.initialize_app(cred)

app = Flask(__name__)
api = Api(app)

app.secret_key = os.environ['APP_SECRET_KEY']

def verify_id_token(id_token):
    """
    Verifies the given id token and returns the user's uid if successful.
    Otherwise, throws an exception.
    """
    # Verify the ID token while checking if the token is revoked by
    # passing check_revoked=True
    decoded_token = auth.verify_id_token(id_token, check_revoked=True)
    # Token is valid and not revoked
    return decoded_token['uid']

@app.route('/')
def index():
    """
    A trivial endpoint left here for debuggging purposes.
    """
    return 'You found the API!', status.HTTP_200_OK

@app.route('/populate', methods=['POST'])
def populate():
    """
    Populates the database for the given user with sample data.
    """
    try:
        id_token = request.form['id_token']
        uid = verify_id_token(id_token)
    except KeyError:
        return "id_token required", status.HTTP_400_BAD_REQUEST
    except ValueError:
        return "id_token unrecognized", status.HTTP_400_BAD_REQUEST
    except auth.AuthError as exc:
        if exc.code == 'ID_TOKEN_REVOKED':
            return "id_token revoked", status.HTTP_400_BAD_REQUEST
        else:
            return "id_token invalid", status.HTTP_400_BAD_REQUEST
    session = Session()
    try:
        dal.populate(session, uid)
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()
        Session.remove()
    classifier.fit(uid)
    return "Sample data added for user", status.HTTP_202_ACCEPTED

@app.route('/add', methods=['POST'])
def add():
    """
    Adds the given text to the database for a user, labeled with the given
    label text, and re-fits their classifier.
    """
    try:
        id_token = request.form['id_token']
        uid = verify_id_token(id_token)
    except KeyError:
        return "id_token required", status.HTTP_400_BAD_REQUEST
    except ValueError:
        return "id_token unrecognized", status.HTTP_400_BAD_REQUEST
    except auth.AuthError as exc:
        if exc.code == 'ID_TOKEN_REVOKED':
            return "id_token revoked", status.HTTP_400_BAD_REQUEST
        else:
            return "id_token invalid", status.HTTP_400_BAD_REQUEST
    try:
        label = request.form['label']
    except KeyError:
        return "label required", status.HTTP_400_BAD_REQUEST
    try:
        text = request.form['text']
    except KeyError:
        return "text required", status.HTTP_400_BAD_REQUEST
    session = Session()
    try:
        dal.add_labeled_text(session, uid, label, text)
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()
        Session.remove()
    classifier.fit(uid)
    return "Labeled text added for user", status.HTTP_202_ACCEPTED

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predicts the text label of every value in the given list of unlabeled text.
    """
    try:
        id_token = request.form['id_token']
        uid = verify_id_token(id_token)
    except KeyError:
        return "id_token required", status.HTTP_400_BAD_REQUEST
    except ValueError:
        return "id_token unrecognized", status.HTTP_400_BAD_REQUEST
    except auth.AuthError as exc:
        if exc.code == 'ID_TOKEN_REVOKED':
            return "id_token revoked", status.HTTP_400_BAD_REQUEST
        else:
            return "id_token invalid", status.HTTP_400_BAD_REQUEST
    try:
        unlabeled_text = json.loads(request.form['unlabeled_text'])
    except KeyError:
        return "unlabeled_text required", status.HTTP_400_BAD_REQUEST
    except ValueError:
        return "unlabeled_text unrecognized", status.HTTP_400_BAD_REQUEST
    session = Session()
    try:
        predicted_labels = classifier.predict(session, uid, list(unlabeled_text.values()))
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()
        Session.remove()
    predictions = dict(zip(unlabeled_text.keys(), predicted_labels))
    return json.dumps(predictions), status.HTTP_200_OK

@app.route('/reset', methods=['POST'])
def reset():
    """
    Deletes all of the user's data from the database.
    """
    try:
        id_token = request.form['id_token']
        uid = verify_id_token(id_token)
    except KeyError:
        return "id_token required", status.HTTP_400_BAD_REQUEST
    except ValueError:
        return "id_token unrecognized", status.HTTP_400_BAD_REQUEST
    except auth.AuthError as exc:
        if exc.code == 'ID_TOKEN_REVOKED':
            return "id_token revoked", status.HTTP_400_BAD_REQUEST
        else:
            return "id_token invalid", status.HTTP_400_BAD_REQUEST
    session = Session()
    try:
        dal.delete(session, uid)
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()
        Session.remove()
    return "User data deleted", status.HTTP_202_ACCEPTED

@app.route('/labels', methods=['POST'])
def labels():
    """
    Get a list of all the given user's labels.
    """
    try:
        id_token = request.form['id_token']
        uid = verify_id_token(id_token)
    except KeyError:
        return "id_token required", status.HTTP_400_BAD_REQUEST
    except ValueError:
        return "id_token unrecognized", status.HTTP_400_BAD_REQUEST
    except auth.AuthError as exc:
        if exc.code == 'ID_TOKEN_REVOKED':
            return "id_token revoked", status.HTTP_400_BAD_REQUEST
        else:
            return "id_token invalid", status.HTTP_400_BAD_REQUEST
    session = Session()
    try:
        labels = dal.get_labels(session, uid)
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()
        Session.remove()
    return json.dumps(labels), status.HTTP_200_OK
