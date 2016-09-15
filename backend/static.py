import os
from flask import json, send_file, abort, url_for, redirect, render_template

from backend import app
from backend.auth import current_user, needs_authorization
from datetime import datetime, timedelta
from backend.models import Nicety, SiteConfiguration
from backend.api import person

@app.route('/')
@needs_authorization
def home():
    return send_file(os.path.realpath(os.path.join(app.static_folder, 'index.html')))

@app.route('/<path:p>')
@needs_authorization
def serve_static_files(p, index_on_error=True):
    """Securely serve static files for the given path using send_file."""

    # Determine the canonical path of the file
    full_path = os.path.realpath(os.path.join(app.static_folder, p))

    # We have a problem if either:
    #   - the path is not a sub-path of app.static_folder; or
    #   - the path does not refer to a real file.
    if (os.path.commonprefix([app.static_folder, full_path]) != app.static_folder or
            not os.path.isfile(full_path)):
        file_to_return = app.config.get('STATIC_FILE_ON_404', None)
        if file_to_return is not None:
            full_path = os.path.realpath(os.path.join(app.static_folder, file_to_return))
        else:
            return abort(404)
    return send_file(full_path)

@app.route('/print-niceties')
def print_niceties():
    ret = {}    # Mapping from target_id to a list of niceties for that person
    last_target = None
    is_faculty = True #json.loads(person(current_user().id).data)['is_faculty']
    two_weeks_from_now = datetime.now() - timedelta(days=14)
    if is_faculty == True:
        valid_niceties = (Nicety.query
                          #.filter(Nicety.end_date < two_weeks_from_now)
                          .order_by(Nicety.target_id)
                          .all())
        for n in valid_niceties:
            if n.target_id != last_target:
                # ... set up the test for the next one
                last_target = n.target_id
                ret[n.target_id] = []  # initialize the dictionary
            if n.anonymous == False:
                ret[n.target_id].append({
                    'author_id': n.author_id,
                    'name': json.loads(person(n.author_id).data)['name'],
                    'text': n.text,
                })
            else:
                ret[n.target_id].append({
                    'text': n.text,
                })
        data = []
        for k, v in ret.items():
            data.append({
                'to': json.loads(person(k).data)['name'],
                'niceties': v
            })
        return render_template('printniceties.html', data=data)
    else:
        return redirect(url_for(home()))
