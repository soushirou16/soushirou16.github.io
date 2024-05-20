from flask import Flask, request, redirect, url_for, session, jsonify, render_template
from requests_oauthlib import OAuth2Session
import requests
import webbrowser
import json

cache={}

with open('config.json', 'r') as config_json:
    config = json.load(config_json)
    client_id = config['client_id']
    client_secret = config["client_secret"]
    redirect_url = config["redirect_url"]

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('strava.html')


@app.route('/authorize')
def authorize():
    session = OAuth2Session(client_id=client_id, redirect_uri=url_for('callback', _external=True))
    session.scope = "activity:read_all"
    
    auth_url, state = session.authorization_url("https://www.strava.com/oauth/authorize")
    return redirect(auth_url)

@app.route('/callback')
def callback():
    # Extract the authorization response from the URL query parameters
    code = request.args.get('code')
    if code:
        # Fetch the token using the authorization code
        session = OAuth2Session(client_id=client_id, redirect_uri=url_for('callback', _external=True))
        token_url = "https://www.strava.com/api/v3/oauth/token"
        token_response = session.fetch_token(
            token_url=token_url,
            code=code,
            client_id=client_id,
            client_secret=client_secret
        )

        # Check if token retrieval was successful
        if 'access_token' in token_response:

            cache['access_token'] = token_response['access_token']

            return "Successfully fetched token...", 200
        else:
            return "Failed to fetch or store token...", 400


@app.route('/athlete/activities')
def get_activities():
    # Ensure the user is authenticated
    if 'access_token' not in cache:
        return 'Not authenticated', 401

    strava = OAuth2Session(client_id, token=cache)

    param = {
        'per_page': '200',
        'after': '1704110400'
    }

    response = strava.get("https://www.strava.com/api/v3/athlete/activities", params=param)

    if response.status_code == 200:
        activities = response.json()
        return activities
    else:
        return 'Failed to fetch activities', response.status_code





if __name__ == '__main__':
    app.run()