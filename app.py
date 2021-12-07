import string
import os
import random
import requests

from flask import Flask, request, session, render_template, jsonify
from flask_cors import CORS, cross_origin

# serving the Flask Shell App using CORS
app = Flask(__name__, static_url_path='', static_folder="build", template_folder="build")
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# In a nutshell, hackers can use a rainbow table against your session to
# find out the secret key and parrot your app.
app.secret_key = '-' \
                    .join(random.choices(string.ascii_uppercase + \
                    string.digits, k=10))

kilterboarduser = os.getenv("KILTERBOARDUSER")
kilterboardpass = os.getenv("KILTERBOARDPASS")

@app.route("/")
def index():
   '''Main Page'''
   return render_template('index.html')

@app.route("/export", methods=["POST"])
def export():
    #Get auth and assemble headers for later
    try:
        r = requests.post('https://api.kilterboardapp.com/v1/logins', json = {"username":kilterboarduser,"password":kilterboardpass})
        auth = "Bearer " + r.json()['token']
        headers = {'Authorization': auth}


        #Assemble climb metadata
        uuid = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(32))
        layout_id=1
        setter_id = 108522
        name = ''.join(random.choice(string.ascii_lowercase) for i in range(10))
        description = ''
        is_draft = False
        frames_count = 1
        frames_pace = 0
        placements = request.json

        newClimb = {"uuid":uuid,"layout_id":layout_id,"setter_id":setter_id,"name":name,"description":description,"is_draft":is_draft,"frames_count":frames_count,"frames_pace":frames_pace,"placements":placements}

        r = requests.put('https://api.kilterboardapp.com/v1/climbs/'+uuid, headers=headers,json = newClimb)
    except requests.exceptions.RequestException as e:
        return jsonify({"Fail": "request error"})

    return jsonify({"Success": name})

# app main
if __name__ == '__main__':
    app.run(debug=True)
