import requests
import json
import csv

# email = "cjb@vt.edu"
email = "benbrott@vt.edu"
# email = "tester@test.com"
# password = "nSYkfRWDfU9DjYRDDE4B"
password = "#Test123"
# password = "test123"
host = "https://spareme.pw"
# host = "https://test.spareme.pw"
num_rows = 100000
batch_size = 10

# https://stackoverflow.com/a/49117597
url = "%s?key=%s" % ("https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword", 'AIzaSyChlMr2JjKHUiLawb35Ar66FbQ1G_qJExU')
data = {"email": email, "password": password, "returnSecureToken": True}
id_token = requests.post(url, json=data).json()['idToken']

r = requests.post(host + '/rebuild', data = {
    'id_token': id_token})
print(r.text)

# r = requests.post(host + '/stats', data = {
#     'id_token': id_token})
# print(r.text)

# r = requests.post(host + '/labels', data = {
#     'id_token': id_token})
# print(r.text)

# unlabeled_text = {}
# correct_label = {}
# hate_speech_predicted = 0
# with open('labeled_data.csv') as csvfile:
#     reader = csv.DictReader(csvfile)
#     for i, row in enumerate(reader):
#         if i >= num_rows:
#             break
#         if i % 10 == 0:
#             id_token = requests.post(url, json=data).json()['idToken']
#         unlabeled_text[str(i)] = row['tweet']
#         correct_label[str(i)] = 'hate_speech' if int(row['hate_speech']) > 0 else 'harmless'
#         if len(unlabeled_text) >= batch_size:
#             r = requests.post(host + '/predict', data = {
#                 'id_token': id_token,
#                 'unlabeled_text': json.dumps(unlabeled_text)})
#             for k,v in json.loads(r.text).items():
#                 if v == 'hate_speech':
#                     hate_speech_predicted = hate_speech_predicted + 1
#                     print('predicted hate speech: ' + unlabeled_text[k])
#                 # if v != correct_label[k]:
#                 #     print("expected: " + correct_label[k] + " but got " + v)
#             unlabeled_text = {}
#             correct_label = {}

# print("hate speech predicted: " + str(hate_speech_predicted))
