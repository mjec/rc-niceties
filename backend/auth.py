import os

from functools import wraps
import flask_oauthlib
from flask import session, url_for, redirect, request
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
        return rc.authorize(callback=url_for('authorized', _external=True, _scheme='https'))
    # return rc.authorize(callback='urn:ietf:wg:oauth:2.0:oob')

# @app.route('/logout')
# def logout():
#     session.pop('rc_token', None)
#     session.pop('user_id', None)
#     _current_user_memo = None
#     print(session)
#     return redirect(url_for('home'))

@app.route('/login/authorized')
def authorized():
    resp = rc.authorized_response()
    if resp is None:
        raise AuthorizationFailed(
            'Error: {} ({})'.format(
                request.args['error'],
                request.args['error_description']
            ))
    session['rc_token'] = (resp['access_token'], '')
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
            return f(*args, **kwargs)
        except flask_oauthlib.client.OAuthException:
            return redirect(url_for('home'))
    return decorated_function
