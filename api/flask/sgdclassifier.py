from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.model_selection import GridSearchCV
from sklearn.linear_model import SGDClassifier
from collections import Counter

import dal

def fit(uid):
    labeled_text = dal.get_labeled_text(uid)
    # Requires enough data for each target to be split into training, test, and
    # validation sets.
    if len(labeled_text['targets']) >= 2 and all(i >= 3 for i in Counter(labeled_text['targets']).values()):
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

        # persist the classifier to the db
        dal.update_classifier(uid, gs_clf)
