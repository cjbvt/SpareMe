import requests
import json
import csv

#host = "https://spareme.pw"
host = "https://test.spareme.pw"

# https://stackoverflow.com/a/49117597
url = "%s?key=%s" % ("https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword", 'AIzaSyChlMr2JjKHUiLawb35Ar66FbQ1G_qJExU')
data = {"email": 'cjb@vt.edu', "password": 'nSYkfRWDfU9DjYRDDE4B', "returnSecureToken": True}
result = requests.post(url, json=data)
is_login_successful = result.ok
id_token = result.json()['idToken']

# verify API is up
r = requests.get(host + '/')
assert r.text == "You found the API!"

r = requests.post(host + '/stats', data = {
    'id_token': id_token})
print(r.text)

r = requests.post(host + '/labels', data = {
    'id_token': id_token})
print(r.text)

# timeout the api by calling predict with a huge amount of data
unlabeled_text = {}
with open('labeled_data.csv') as csvfile:
    reader = csv.DictReader(csvfile)
    i = 0
    for row in reader:
        i = i + 1
        unlabeled_text[str(i)] = row['tweet']
        r = requests.post(host + '/predict', data = {
            'id_token': id_token,
            'unlabeled_text': json.dumps(unlabeled_text)})
        if 'harmless' not in r.text:
            print(row['tweet'])
            print(r.text)
        unlabeled_text = {}

# verify API is up
r = requests.get(host + '/')
assert r.text == "You found the API!"

r = requests.post(host + '/stats', data = {
    'id_token': id_token})
print(r.text)

r = requests.post(host + '/labels', data = {
    'id_token': id_token})
print(r.text)
