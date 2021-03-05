import os
from collections import OrderedDict
from datetime import datetime, timedelta

from backend import app
from backend.api import cache_person_call
from backend.auth import current_user, needs_authorization
from backend.models import Nicety
from backend.util import admin_access, decode_str
from flask import abort, jsonify, render_template, send_file


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


@app.route('/SFPixelate-Bold.ttf')
def font():
    return send_file(os.path.realpath(os.path.join('SFPixelate-Bold.ttf')))


@app.route('/niceties-by-sender')
def niceties_by_sender():
    ret = {}    # Mapping from target_id to a list of niceties for that person
    is_rachel = admin_access(current_user())
    if is_rachel is True:
        valid_niceties = (Nicety.query
                          .order_by(Nicety.author_id)
                          .all())
        last_author = None
        for n in valid_niceties:
            author = cache_person_call(n.author_id)['full_name']
            if author != last_author:
                # ... set up the test for the next one
                last_author = author
                ret[author] = []  # initialize the dictionary
            if n.text is not None and n.text.isspace() is False:
                if n.anonymous is False:
                    ret[author].append({
                        'target_id': n.target_id,
                        'anon': False,
                        'name': cache_person_call(n.target_id)['full_name'],
                        'text': decode_str(n.text),
                    })
                else:
                    ret[author].append({
                        'anon': True,
                        'name': "An Unknown Admirer",
                        'text': decode_str(n.text),
                    })
        ret = OrderedDict(sorted(ret.items(), key=lambda t: t[0]))
        names = ret.keys()
        data = []
        for k, v in ret.items():
            # sort by name, then sort by reverse author_id
            data.append({
                'to': k,
                'niceties':
                sorted(sorted(v, key=lambda k: k['name']), key=lambda k: k['anon'])
            })
        return render_template('nicetiesbyusers.html',
                               data={
                                   'names': names,
                                   'niceties': data
                               })
    else:
        return jsonify({'authorized': "false"})


@app.route('/print-niceties')
def print_niceties():
    ret = {}    # Mapping from target_id to a list of niceties for that person
    is_rachel = admin_access(current_user())
    three_weeks_ago = datetime.now() - timedelta(days=21)
    three_weeks_from_now = datetime.now() + timedelta(days=21)
    if is_rachel is True:
        valid_niceties = (Nicety.query
                          .filter(Nicety.end_date > three_weeks_ago)
                          .filter(Nicety.end_date < three_weeks_from_now)
                          .order_by(Nicety.target_id)
                          .all())
        last_target = None
        for n in valid_niceties:
            target = cache_person_call(n.target_id)['full_name']
            if target != last_target:
                # ... set up the test for the next one
                last_target = target
                ret[target] = []  # initialize the dictionary
            if n.text is not None and n.text.isspace() is False:
                if n.anonymous is False:
                    ret[target].append({
                        'author_id': n.author_id,
                        'anon': False,
                        'name': cache_person_call(n.author_id)['full_name'],
                        'text': decode_str(n.text),
                    })
                else:
                    ret[target].append({
                        'anon': True,
                        'name': "An Unknown Admirer",
                        'text': decode_str(n.text),
                    })
        ret = OrderedDict(sorted(ret.items(), key=lambda t: t[0]))
        names = ret.keys()
        data = []
        for k, v in ret.items():
            # sort by name, then sort by reverse author_id
            data.append({
                'to': k,
                'niceties':  # sorted(v, key=lambda k: k['name'])
                sorted(sorted(v, key=lambda k: k['name']), key=lambda k: k['anon'])
            })
        return render_template('printniceties.html',
                               data={
                                   'names': names,
                                   'niceties': data
                               })
    else:
        return jsonify({'authorized': "false"})
