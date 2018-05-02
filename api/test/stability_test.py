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

# reset the api to make a clean slate for testing
# r = requests.post(host + '/reset', data = {
#     'id_token':id_token
#     })

# crash the API by triggering a sqlalchemy.exc.ProgrammingError (psycopg2.ProgrammingError)
# misuse of sessions was creating race conditions in which any sort of deletions resulted in catastrophic crashes
# with open('labeled_data.csv') as csvfile:
#     reader = csv.DictReader(csvfile)
#     i = 0
#     for row in reader:
#         i = i + 1
#         # add the hate speech to the API
#         label = 'hate_speech' if int(row['hate_speech']) > 0 else 'harmless'
#         r = requests.post(host + '/add', data = {
#             'id_token': id_token,
#             'label': label,
#             'text': row['tweet']})
#         if i > 10000:
#             break

# reset the api to delete user data while model is being rebuilt
# r = requests.post(host + '/reset', data = {
#     'id_token':id_token
#     })

# verify API is up
r = requests.get(host + '/')
assert r.text == "You found the API!"

r = requests.post(host + '/stats', data = {
    'id_token': id_token})
print(r.text)

r = requests.post(host + '/labels', data = {
    'id_token': id_token})
print(r.text)
