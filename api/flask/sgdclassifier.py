from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.model_selection import GridSearchCV
from sklearn.linear_model import SGDClassifier
from collections import Counter

import os
import pickle
import tempfile

import dal

def fit(session, uid, path):
    labeled_text = dal.get_id_labeled_text(session, uid)

    # Requires enough data for each target to be split into training, test, and
    # validation sets.
    if len(labeled_text['targets']) < 2 or any(i < 3 for i in Counter(labeled_text['targets']).values()):
        return

    # support vector machine classifier
    text_clf = Pipeline([
        ('vect', CountVectorizer()),
        ('tfidf', TfidfTransformer()),
        ('clf', SGDClassifier(
            loss='hinge', penalty='l2',
            alpha=1e-3, random_state=42,
            max_iter=5, tol=None))])

    # exhaustively search for best classifier parameters
    parameters = {
        'vect__ngram_range': [(1, 1), (1, 2)],
        'tfidf__use_idf': (True, False),
        'clf__alpha': (1e-2, 1e-3)}
    gs_clf = GridSearchCV(text_clf, parameters, n_jobs=-1)

    # train the classifier
    gs_clf.fit(labeled_text['data'], labeled_text['targets'])

    # serialize the model out to the temporary model file
    with open(path, "wb") as f:
        pickle.dump(gs_clf, f)

def predict(session, uid, path, unlabeled_text):
    # deserialize the model in from the temporary model file
    with open(path, "rb") as f:
        gs_clf = pickle.load(f)

    # use the model to predict the most likely label for each of the given strings
    predicted_ids = gs_clf.predict(unlabeled_text)

    # convert the predicted label ids to actual label text for each unlabeled text string
    return [dal.get_label_text(session, uid, int(id)) for id in predicted_ids]
