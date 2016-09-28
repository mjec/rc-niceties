import os
import sys
import flask_oauthlib

from functools import wraps
from flask import session, url_for, redirect, request, json
from werkzeug.exceptions import HTTPException

from backend import app, rc, db, util
from backend.models import User


class AuthorizationFailed(HTTPException):
    code = 403
    def __init__(self, **kwargs):
        self.description = kwargs.get('description', '')

@app.route('/login')
def login():
    if app.config.get('DEV') == 'TRUE':
        return rc.authorize(callback=url_for('authorized', _external=True))
    elif app.config.get('DEV') == 'FALSE':
        print("abc")
        sys.stdout.flush()
        print(redirect(url_for('authorized', _external=True, _scheme='https')))
        sys.stdout.flush()
        return rc.authorize(callback=redirect(url_for('authorized', _external=True, _scheme='https')))

@app.route('/login/authorized')
def authorized():
    resp = rc.authorized_response()
    if resp is None:
        raise AuthorizationFailed(
            'Error: {} ({})'.format(
                request.args['error'],
                request.args['error_description']
            ))
    session['rc_token'] = (resp['access_token'], resp['refresh_token'], resp['expires_in'])
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
    return session.get('rc_token')

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
            if current_user() is None:
                return redirect(url_for('login'))
            else:
                return f(*args, **kwargs)
        except flask_oauthlib.client.OAuthException:
            if current_user() is None:
                return redirect(url_for('login'))
            else:
                return f(*args, **kwargs)
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
