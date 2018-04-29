import fastText
import os
import tempfile
from subprocess import Popen, PIPE, STDOUT

import dal

# https://github.com/facebookresearch/fastText/blob/master/python/fastText/FastText.py
# https://github.com/facebookresearch/fastText/blob/master/python/doc/examples/train_supervised.py

label_prefix = "__label__"

def preprocess(datum):
    # strip exclamation points and newlines
    stripped_datum = datum.replace('!','').replace('\r','').replace('\n','')

    # convert to lowercase
    lowercased_datum = stripped_datum.lower()

    # tokenize the datum
    p = Popen(["perl", "tokenizer.perl", "-q"], stdout=PIPE, stdin=PIPE)
    tokenized_datum = p.communicate(input=lowercased_datum.encode())[0].decode()

    # strip any newlines added by tokenizer or Popen
    return tokenized_datum.replace('\r','').replace('\n','')

def fit(session, uid, path):
    labeled_text = dal.get_text_labeled_text(session, uid)

    # bail out if the model was already trained after the last label text was added
    text_timestamp = dal.get_labeled_text_timestamp(session, uid)
    classifier_timestamp = dal.get_classifier_timestamp(session, uid)
    if text_timestamp and classifier_timestamp and text_timestamp < classifier_timestamp:
        return

    # not sure if this is the right prereq for fasttext
    if len(labeled_text['targets']) < 2:
        return

    # preprocess training data one line at a time in order to limit pipe buffer issues
    preprocessed_data = [preprocess(datum) for datum in labeled_text['data']]

    # create a new temporary training data file
    fd, train_path = tempfile.mkstemp()

    # close the temporary training data file descriptor as we don't need it
    os.close(fd)

    # fill the temporary training data file
    with open(train_path, 'w') as f:
        for (target, datum) in zip(labeled_text['targets'], preprocessed_data):
            f.write(label_prefix + target + " " + datum + "\n")

    # train the fasttext model
    model = fastText.train_supervised(input=train_path)

    # compress the fasttext model to save space (disabled for now because it requires at least 256 rows)
    #model.quantize(input=train_path)

    # delete the temporary training data file
    os.unlink(train_path)

    # serialize the model out to the temporary model file
    model.save_model(path)

def predict(session, uid, path, unlabeled_text):
    # preprocess training data one line at a time in order to limit pipe buffer issues
    preprocessed_data = [preprocess(datum) for datum in unlabeled_text]

    # deserialize the model in from the temporary model file
    model = fastText.load_model(path)

    # use the model to predict the most likely label for each of the given strings
    all_labels, _ = model.predict(preprocessed_data)

    # strip off the label prefix and return only the most likely label for each unlabeled text string
    return [labels[0].replace(label_prefix,'') for labels in all_labels]
