import fastText
import os
import tempfile

import dal

# https://github.com/facebookresearch/fastText/blob/master/python/fastText/FastText.py
# https://github.com/facebookresearch/fastText/blob/master/python/doc/examples/train_supervised.py

label_prefix = "__label__"

def fit(session, uid, path):
    labeled_text = dal.get_text_labeled_text(session, uid)

    # not sure if this is the right prereq for fasttext
    if len(labeled_text['targets']) < 2:
        return

    # create a new temporary training data file
    fd, train_path = tempfile.mkstemp()

    # close the temporary training data file descriptor as we don't need it
    os.close(fd)

    # fill the temporary training data file
    with open(train_path, 'w') as f:
        for (target, datum) in zip(labeled_text['targets'], labeled_text['data']):
            f.write(label_prefix + target + " " + datum + "\n")

    # train the fasttext model
    model = fastText.train_supervised(input=train_path)

    # compress the fasttext model to save space (disabled for now because it requires at least 256 rows)
    #model.quantize(input=train_path)

    # delete the temporary training data file
    os.unlink(train_path)

    # serialize the model out to the temporary model file
    model.save_model(path)

def predict(uid, path, unlabeled_text):
    # deserialize the model in from the temporary model file
    model = fastText.load_model(path)

    # use the model to predict the most likely label for each of the given strings
    all_labels, _ = model.predict(unlabeled_text)

    # strip off the label prefix and return only the most likely label for each unlabeled text string
    return [labels[0].replace(label_prefix,'') for labels in all_labels]
