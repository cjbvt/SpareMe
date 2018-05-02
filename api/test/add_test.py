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

# https://stackoverflow.com/a/49117597
url = "%s?key=%s" % ("https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword", 'AIzaSyChlMr2JjKHUiLawb35Ar66FbQ1G_qJExU')
data = {"email": email, "password": password, "returnSecureToken": True}

try:
    id_token = requests.post(url, json=data).json()['idToken']
except(KeyError):
    pass

# r = requests.post(host + '/rebuild', data = {
#     'id_token':id_token
#     })

r = requests.post(host + '/reset', data = {
    'id_token':id_token
    })

with open('labeled_data.csv') as csvfile:
    reader = csv.DictReader(csvfile)
    for i, row in enumerate(reader):
        if i >= num_rows:
            break
        if i % 10 == 0:
            try:
                id_token = requests.post(url, json=data).json()['idToken']
            except(KeyError):
                pass
        label = 'hate_speech' if int(row['hate_speech']) > 0 else 'harmless'
        r = requests.post(host + '/add', data = {
            'id_token': id_token,
            'label': label,
            'text': row['tweet']})

try:
    id_token = requests.post(url, json=data).json()['idToken']
except(KeyError):
    pass

r = requests.post(host + '/stats', data = {
    'id_token': id_token})
print(r.text)

r = requests.post(host + '/labels', data = {
    'id_token': id_token})
print(r.text)
