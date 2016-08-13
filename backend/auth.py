from flask import session, url_for, redirect, request, jsonify
from werkzeug.exceptions import HTTPException

from backend import app, rc, db, util
from backend.models import User


class AuthorizationFailed(HTTPException):
    code = 403

    def __init__(self, **kwargs):
        self.description = kwargs.get('description', '')


@app.route('/api/v1/login')
def login():
    return rc.authorize(callback=url_for('authorized', _external=True))


@app.route('/api/v1/logout')
def logout():
    session.pop('rc_token', None)
    return redirect(url_for('whoami'))


@app.route('/api/v1/login/authorized')
def authorized():
    resp = rc.authorized_response()
    if resp is None:
        raise AuthorizationFailed(
            'Error: {} ({})'.format(
                request.args['error'],
                request.args['error_description']
            ))
    session['rc_token'] = (resp['access_token'], '')
    me = rc.get('people/me')
    print(me)
    user = User.query.get(me.id)
    if user is None:
        user = User(
            id=me.id,
            name=util.name_from_rc_person(me),
            avatar_url=me.image,
            is_faculty=me.is_faculty)
        db.session.add(user)
        db.session.commit()
    elif user.is_faculty != me.is_faculty:
        user.is_faculty = me.is_faculty
        db.session.commit()
    session['user'] = user
    return jsonify({'status': 'OK'})


@rc.tokengetter
def get_oauth_token():
    return session.get('rc_token')
