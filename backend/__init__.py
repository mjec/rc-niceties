import os
from base64 import b64decode

from flask import Flask
from flask_oauthlib.client import OAuth
from flask_sqlalchemy import SQLAlchemy

MOCK_OUT_RC_API = False

# Flask won't route URLs in the static_url_path, so we set it to something
# arbitrary and unlikely to be ever used (hence the included random GUID).
app = Flask(__name__, static_url_path='/noroute/aeae9ce2-1457-494f-9881-29d9df71a526')
app.config.from_object(__name__)

# We deliberately generate an exception if relevant environment variables are not set
app.config.update(dict(
    SECRET_KEY=b64decode(os.environb[b'FLASK_SECRET_KEY_B64']),
    SQLALCHEMY_DATABASE_URI=os.environ['DATABASE_URL'],
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    STATIC_BASE=os.path.realpath(os.path.abspath(os.path.join(app.root_path, '../build/'))),
    STATIC_FILE_ON_404='index.html',
    DEV=os.environ['DEV']
))
app.static_folder = app.config.get('STATIC_BASE', './static/')

with app.app_context():
    db = SQLAlchemy(app)
    rc = OAuth(app).remote_app(
        'recurse_center',
        base_url='https://www.recurse.com/api/v1/',
        access_token_url='https://www.recurse.com/oauth/token',
        request_token_url=None,
        authorize_url='https://www.recurse.com/oauth/authorize',
        consumer_key=os.environ['RC_OAUTH_ID'],  # Deliberately throw exception if not set
        consumer_secret=os.environ['RC_OAUTH_SECRET'],  # Deliberately throw exception it not set
        access_token_method='POST',
    )

# Imports for URLs that should be available
import backend.api  # noqa
import backend.auth  # noqa
import backend.static  # noqa

# This file exports:
#   app     The Flask() object
#   db      The SQLAlchemy() object
#   rc      The OAuth() object for the RC remote application
