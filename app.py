import string
import os
import random

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

@app.route("/")
def index():
   '''Main Page'''
   return render_template('index.html')

# app main
if __name__ == '__main__':
    app.run(debug=True)
