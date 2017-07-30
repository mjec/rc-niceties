import os
import sys
from time import time
import flask_oauthlib
import requests

from functools import wraps
from flask import session, url_for, redirect, request, json, Response, jsonify
from werkzeug.exceptions import HTTPException

from backend import app, rc, db, util
from backend.models import User


class AuthorizationFailed(HTTPException):
    code = 403

    def __init__(self, **kwargs):
        self.description = kwargs.get('description', '')

@app.route('/authorize', methods=['POST'])
def authorize():
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

@app.route('/rc-test', methods=['GET'])
def rc_test():
    access_token = request.headers['X-Access-Token']
    print(access_token)
    headers = {
            'Authorization': 'Bearer ' + access_token
            }
    resp = requests.get('https://www.recurse.com/api/v1/profiles/me', headers=headers)
    return jsonify(resp.json())

@app.route('/login')
def login():
    if app.config.get('DEV') == 'TRUE':
        return rc.authorize(url_for('authorized', _external=True))
    elif app.config.get('DEV') == 'FALSE':
        sys.stdout.flush()
        return rc.authorize(os.environ['RC_OAUTH_REDIRECT_URI'])
        #return rc.authorize(url_for('authorized', _external=True, _scheme='https'))

@app.route('/login/authorized')
def authorized():
    resp = rc.authorized_response()
    if resp is None:
        raise AuthorizationFailed(
            'Error: {} ({})'.format(
                request.args['error'],
                request.args['error_description']
            ))
    session['rc_token'] = {
            'access_token': resp['access_token'],
            'refresh_token': resp['refresh_token'],
            'expires_at': resp['expires_in'] + time() - 600 
    }
    me = rc.get('people/me').data
    user = User.query.get(me['id'])
    if user is None:
        user = User(
            id=me['id'],
            name=util.name_from_rc_person(me),
            avatar_url=me['image'],
            is_faculty=me['is_faculty'])
        db.session.add(user)
        db.session.commit()
    elif user.faculty != me['is_faculty']:
        user.faculty = me['is_faculty']
        db.session.commit()
    session['user_id'] = user.id
    return redirect(url_for('home'))

@rc.tokengetter
def get_oauth_token():
    token = session.get('rc_token')
    if time() > token['expires_at']:
        data = {
                'grant_type': 'refresh_token', 
                'client_id': rc.consumer_key,
                'client_secret': rc.consumer_secret,
                'redirect_uri': 'ietf:wg:oauth:2.0:oob',
                'refresh_token': token['refresh_token']
                }
        resp = requests.post('https://www.recurse.com/oauth/token', data=data)
        data = resp.json()
        session['rc_token'] = {
            'access_token': data['access_token'],
            'refresh_token': data['refresh_token'],
            'expires_at': data['expires_in'] + time() - 600 
        }
        return (data['access_token'], '')
    else:
        return (token['access_token'], '') 

_current_user_memo = None

def current_user():
    global _current_user_memo
    if session.get('user_id', None) is None:
        _current_user_memo = None
    elif _current_user_memo is None or _current_user_memo.id != session.get('user_id'):
        _current_user_memo = User.query.get(session.get('user_id'))
        db.session.expunge(_current_user_memo)
    return _current_user_memo

def needs_authorization(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            if (current_user() is None) or (type(session.get('rc_token')) is tuple):
                return redirect(url_for('login'))
            else:
                return f(*args, **kwargs)
        except flask_oauthlib.client.OAuthException:
            ## redirect to 404
            return redirect(url_for('home'))
    return decorated_function

def faculty_only(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        is_faculty = json.loads(person(current_user().id).data)['is_faculty']
        if is_faculty == True:
            return f(*args, **kwargs)
        else:
            ## we need to redirect to a page that says "only for admins
            return redirect(url_for('login'))
    return decorated_function
