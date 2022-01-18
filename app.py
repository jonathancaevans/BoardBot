import string
import os
import random
import requests

from flask import Flask, request, session, render_template, jsonify
from flask_cors import CORS, cross_origin

words = ['abseiling', 'add-on', 'aid', 'alpine', 'anchor', 'arete', 'arm', 'ascend', 'atc', 'back-clipping', 'back-step', 'barn-door', 'belay', 'beta', 'bicycle', 'biner', 'bolt', 'bomb', 'bomb-proof', 'bouldering', 'bridging', 'bump', 'buildering', 'cam', 'campus', 'camming', 'chalk', 'cheese', 'chicken', 'head', 'wing', 'chimney', 'chipping', 'choss', 'clean', 'gym', 'shoe', 'climbing', 'contact', 'strength', 'cordelette', 'corner', 'crag', 'crank', 'crimp', 'crux', 'cut-loose', 'dab', 'dead', 'deck', 'dihedral', 'dirtbag', 'downclimb', 'drive-by', 'deadpoint', 'dry', 'fire', 'dynamic', 'dyno', 'edge', 'egyptian', 'eliminate', 'elvis', 'epic', 'exposure', 'extreme', 'face', 'feature', 'figure', 'four', 'jam', 'finger', 'board', 'first', 'ascensionist', 'fa', 'fist', 'flagging', 'inside', 'outside', 'flake', 'slab', 'rock', 'flapper', 'flash', 'solo', 'free', 'gaston', 'greenpoint', 'grigri', 'gumby', 'hangdog', 'headpoint', 'heel', 'hook', 'highball', 'hold', 'horn', 'jamming', 'jib', 'jug', 'jumar', 'laybacking', 'angle', 'mantle', 'match', 'mono', 'pitch', 'off-width', 'on-sight', 'pinch', 'polish', 'positive', 'problem', 'project', 'pumped', 'punter', 'psyched', 'quickdraw', 'rack', 'rappel', 'redpoint', 'roof', 'rose', 'runout', 'sandbag', 'screw on', 'send', 'sit', 'start', 'sloper', 'smearing', 'static', 'steep', 'technical', 'tension', 'toe', 'hook', 'top', 'training', 'traverse', 'tufa', 'volume', 'wired', 'zone']

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
        name = ''.join([str(word) + ' ' for word in random.choices(words, k = 3)]).strip()
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

@app.route("/gradeClimb", methods=["POST"])
def gradeClimb():
    name = request.json.get("name")

    sync = {"client":{"enforces_product_passwords":1,"enforces_layout_passwords":1,"manages_power_responsibly":1},"GET":{"query":{"include_multiframe_climbs":0,"include_all_beta_links":1,"tables":["climbs"],"syncs":{"shared_syncs":[{"table_name":"climbs","last_synchronized_at":"2018-3-27 15:45:25.021411"}]}}}}
    r = requests.post('https://api.kilterboardapp.com/v1/sync', json=sync)

    for climb in r.json()['PUT']['climbs']:
        if climb['name'] == name:
            return jsonify(climb['placements'])

    emptylist = []
    return jsonify(emptylist)

# app main
if __name__ == '__main__':
    app.run(debug=True)
