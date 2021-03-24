import os
import sys
from functools import wraps
from time import time

import flask_oauthlib
import requests
from backend import app, db, rc, util
from backend.models import User
from flask import json, redirect, request, session, url_for
from werkzeug.exceptions import HTTPException


class AuthorizationFailed(HTTPException):
    code = 403

    def __init__(self, **kwargs):
        self.description = kwargs.get('description', '')


@app.route('/login')
def login():
    if app.config.get('DEV') == 'TRUE':
        return rc.authorize(url_for('authorized', _external=True))
    elif app.config.get('DEV') == 'FALSE':
        sys.stdout.flush()
        return rc.authorize(os.environ['RC_OAUTH_REDIRECT_URI'])


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
    me = rc.get('profiles/me').data
    user = User.query.get(me['id'])
    if user is None:
        user = User(
            id=me['id'],
            name=util.name_from_rc_person(me),
            avatar_url=me['image_path'],
            is_faculty=util.profile_is_faculty(me),
        )
        db.session.add(user)
        db.session.commit()
    elif user.faculty != util.profile_is_faculty(me):
        user.faculty = util.profile_is_faculty(me)
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
            # redirect to 404
            return redirect(url_for('home'))
    return decorated_function


def faculty_only(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # TODO fix this??
        is_faculty = json.loads(person(current_user().id).data)['is_faculty']
        if is_faculty is True:
            return f(*args, **kwargs)
        else:
            # we need to redirect to a page that says "only for admins
            return redirect(url_for('login'))
    return decorated_function
