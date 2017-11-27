import os
import sys
from time import time
import flask_oauthlib
import requests

from functools import wraps
from flask import session, url_for, redirect, request, json, Response, jsonify
from werkzeug.exceptions import HTTPException

from backend import app, rc, db, util

class AuthorizationFailed(HTTPException):
    code = 403

    def __init__(self, **kwargs):
        self.description = kwargs.get('description', '')

@app.route('/auth/authorize', methods=['POST'])
def auth_authorize():
    code = request.get_json()['code']
    data = {
            'grant_type': 'authorization_code', 
            'client_id': os.environ['RC_OAUTH_ID'],
            'client_secret': os.environ['RC_OAUTH_SECRET'],
            'redirect_uri': os.environ['RC_OAUTH_REDIRECT_URI'],
            'code': code
            }
    resp = requests.post('https://www.recurse.com/oauth/token', data=data)
    return jsonify(resp.json()) 

@app.route('/admin/refresh', methods=['POST'])
def auth_refresh():
    refresh_token = request.get_json()['refresh_token']
    data = {
            'grant_type': 'refresh_token',
            'client_id': os.environ['RC_OAUTH_ID'],
            'client_secret': os.environ['RC_OAUTH_SECRET'] ,
            'refresh_token': refresh_token
            }
    resp = requests.post('https://www.recurse.com/oauth/token', data=data)
    return jsonify(resp.json());
