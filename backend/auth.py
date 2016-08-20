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
    print(url_for('authorized', _external=True))
    return rc.authorize(callback=url_for('authorized', _external=True))


@app.route('/api/v1/logout')
def logout():
    session.pop('rc_token', None)
    session.pop('user_id', None)
    return redirect(url_for('home'))


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

# I think the exception shouldn't be raised on the server side, it should result in an error page.
# We really want a friendlier error page than that -- because that indicates an unhandled
# exception on the server.
# I mean, it's not a particularly big deal, but
# What will happen is the API endpoint will return a 500 status code, and the client
# application will think the server has crashed; whereas it should return a 403 which
# indicates the client needs to login, or a 404 meaning no such page etc etc.

# It will also fill up the logs with stack traces.
# sorry - i realized i have to go pick up my book

# I Can do whenever, after hours. As an alum I'm not supposed to be in the space 10am - 6pm Mon - Wed.


def current_user():
    global _current_user_memo
    if session.get('user_id', None) is None:
        _current_user_memo = None
    elif _current_user_memo is None or _current_user_memo.id != session.get('user_id'):
        _current_user_memo = User.query.get(session.get('user_id'))
        db.session.expunge(_current_user_memo)
    return _current_user_memo
