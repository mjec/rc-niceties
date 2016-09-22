import os
from collections import OrderedDict

from datetime import datetime, timedelta
from flask import json, jsonify, send_file, abort, url_for, redirect, render_template

from backend import app
from backend.auth import current_user, needs_authorization
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
    is_rachel = current_user().id == 770
    two_weeks_from_now = datetime.now() + timedelta(days=14)
    if is_rachel == True:
        valid_niceties = (Nicety.query
                          .filter(Nicety.end_date < two_weeks_from_now)
                          .order_by(Nicety.target_id)
                          .all())
        last_target = None
        for n in valid_niceties:
            target = json.loads(person(n.target_id).data)['full_name']
            if target != last_target:
                # ... set up the test for the next one
                last_target = target
                ret[target] = []  # initialize the dictionary
            if n.text is not None and n.text.isspace() == False:
                if n.anonymous == False:
                    ret[target].append({
                        'author_id': n.author_id,
                        'anon': False,
                        'name': json.loads(person(n.author_id).data)['full_name'],
                        'text': n.text,
                    })
                else:
                    ret[target].append({
                        'anon': True,
                        'name': "An Unknown Admirer",
                        'text': n.text,
                    })
        ret = OrderedDict(sorted(ret.items(), key=lambda t: t[0]))
        names = ret.keys()
        data = []
        for k, v in ret.items():
            # sort by name, then sort by reverse author_id
            data.append({
                'to': k,
                'niceties': #sorted(v, key=lambda k: k['name'])
                sorted(sorted(v, key=lambda k: k['name']), key=lambda k: k['anon'])
            })
        return render_template('printniceties.html',
                               data={
                                   'names': names,
                                   'niceties': data
                               })
    else:
        return jsonify({'authorized': "false"})
