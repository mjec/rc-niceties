from flask import json, jsonify, request, abort, url_for, redirect
from flask.views import MethodView
from datetime import datetime
import random

from backend import app, rc, db
from backend.models import Nicety, SiteConfiguration
from backend.auth import current_user, needs_authorization
import backend.cache as cache
import backend.config as config
import backend.util as util

@app.route('/api/v1/batches')
@needs_authorization
def batches():
    try:
        return cache.get('batches_list')
    except cache.NotInCache:
        pass
    # rc is a OAuth object. this accesses the "recurse.com/api/v1/batches" API endpoint.
    batches = rc.get('batches').data
    for batch in batches:
        if util.batch_is_open(batch['id'], batch['end_date']):
            batch['is_open'] = True
            batch['closing_time'] = util.batch_closing_time(batch['end_date']).isoformat()
            batch['warning_time'] = util.batch_closing_warning_time(batch['end_date']).isoformat()
        else:
            batch['is_open'] = False
            batch['closing_time'] = None
            batch['warning_time'] = None
            batches_json = jsonify(batches)
            cache.set('batches_list', batches_json)
    return batches_json

@app.route('/api/v1/niceties_to_print')
@needs_authorization
def niceties_to_print():
    ret = {}    # Mapping from target_id to a list of niceties for that person
    last_target = None
    # Loop through all the Niceties that exist for the open batch
    # The batch end date might be 6 weeks or more away, if you're doing a six week stint.
    # So that means it won't be picked up by .. which means it won't appear in the list to print!
    for n in (Nicety.query
                    .filter(Nicety.end_date)
                    .order_by(Nicety.target_id)
                    .all()):
        # If this is a different target_id to the last one...
        if n.target_id != last_target:
            # ... set up the test for the next one

            last_target = n.target_id
            ret[n.target_id] = []  # initialize the dictionary

        ret[n.target_id].append({
            'author_id': n.author_id,
            'anonymous': n.anonymous,
            'text': n.text,
        })
    return jsonify([
        {
            'to': k,
            'niceties': v
        }
        for k, v in ret.items()
    ])


@app.route('/api/v1/batches/<int:batch_id>/people')
@needs_authorization
def batch_people(batch_id):
    try:
        cache_key = 'batches_people_list:{}'.format(batch_id)
        people = cache.get(cache_key)
    except cache.NotInCache:
        people = []
        for p in rc.get('batches/{}/people'.format(batch_id)).data:
            people.append({
                'id': p['id'],
                'name': util.name_from_rc_person(p),
                'avatar_url': p['image'],
                'stints': p['stints'],
            })
        cache.set(cache_key, people)
    random.seed(current_user().random_seed)
    random.shuffle(people)  # This order will be random but consistent for the user
    return jsonify(people)


def get_open_batches():
    try:
        return cache.get('open_batches_list')
    except cache.NotInCache:
        pass
    batches = rc.get('batches').data
    for batch in batches:
        if util.end_date_within_range(batch['end_date']):
            batch['is_open'] = True
            batch['closing_time'] = util.batch_closing_time(batch['end_date']).isoformat()
            batch['warning_time'] = util.batch_closing_warning_time(batch['end_date']).isoformat()
        else:
            batch['is_open'] = False
            batch['closing_time'] = None
            batch['warning_time'] = None
    cache.set('open_batches_list', batches)
    return batches

@app.route('/api/v1/people')
@needs_authorization
def exiting_batch():
    cache_key = 'people_list'
    try:
        people = cache.get(cache_key)
        print("cache hit on list")
    except cache.NotInCache:
        print("cache miss on list")
        people = []
        for open_batch in get_open_batches():
            for p in rc.get('batches/{}/people'.format(open_batch['id'])).data:
                latest_end_date = None
                for stint in p['stints']:
                    e = datetime.strptime(stint['end_date'], '%Y-%m-%d')
                    if latest_end_date is None or e > latest_end_date:
                        latest_end_date = e
                        latest_batch_id = stint['batch_id']
                if (latest_end_date is not None and
                    util.end_date_within_range(latest_end_date) and
                    (   # Batchlings have   is_hacker_schooler = True,      is_faculty = False
                        # Faculty have      is_hacker_schooler = ?,         is_faculty = True
                        # Resdients have    is_hacker_schooler = False,     is_faculty = False
                        (p['is_hacker_schooler'] and not p['is_faculty']) or
                        (not p['is_faculty'] and not p['is_hacker_schooler'] and config.get(config.INCLUDE_RESIDENTS, False)) or
                        (p['is_faculty'] and config.get(config.INCLUDE_FACULTY, False)))):
                    people.append({
                        'id': p['id'],
                        'name': util.name_from_rc_person(p),
                        'avatar_url': p['image'],
                        'end_date': latest_end_date,
                    })
        cache.set(cache_key, people)
    random.seed(current_user().random_seed)
    random.shuffle(people)  # This order will be random but consistent for the user
    return jsonify(people)

@app.route('/api/v1/people/<int:person_id>')
@needs_authorization
def person(person_id):
    cache_key = 'person:{}'.format(person_id)
    try:
        return cache.get(cache_key)
    except cache.NotInCache:
        p = rc.get('people/{}'.format(person_id)).data
        person = {
            'id': p['id'],
            'name': util.name_from_rc_person(p),
            'avatar_url': p['image'],
        }
        person_json = jsonify(person)
        cache.set(cache_key, person_json)
        return person_json

class NicetyFromMeAPI(MethodView):
    def get(end_date, person_id):
        if current_user() is None:
            redirect(url_for('authorized'))
        try:
            nicety = (
                Nicety
                .query
                .filter_by(
                    end_date=end_date,
                    target_id=person_id,
                    author_id=current_user().id)
                .one())
        except db.exc.NoResultFound:
            nicety = Nicety(
                end_date=end_date,
                target_id=person_id,
                author_id=current_user().id,
                anonymous=current_user().anonymous_by_default)
            db.session.add(nicety)
            db.session.commit()
        return jsonify(nicety.__dict__)

    def post(end_id, person_id):
        if current_user() is None:
            redirect(url_for('authorized'))
        nicety = (
            Nicety
            .query
            .filter_by(
                end_id=end_id,
                target_id=person_id,
                author_id=current_user().id)
            .one())
        nicety.anonymous = request.form.get("anonymous", current_user().anonymous_by_default)
        text = request.form.get("text").trim()
        if '' == text:
            text = None
        nicety.text = text
        nicety.faculty_reviewed = False
        db.session.commit()
        return jsonify({'status': 'OK'})

app.add_url_rule(
    '/api/v1/niceties/<int:end_id>/<int:person_id>',
    view_func=NicetyFromMeAPI.as_view('nicety_from_me'))


class PreferencesAPI(MethodView):
    def get(self):
        if current_user() is None:
            redirect(url_for('authorized'))
            user = current_user()
        return jsonify({
            'anonymous_by_default': user.anonymous_by_default,
            'autosave_timeout': user.autosave_timeout,
            'autosave_enabled': user.autosave_enabled,
        })

    def post(self):
        if current_user() is None:
            redirect(url_for('authorized'))
        user = current_user()
        user.anonymous_by_default = request.form.get(
            'anonymous_by_default',
            user.anonymous_by_default)
        user.autosave_timeout = request.form.get(
            'autosave_timeout',
            user.autosave_timeout)
        user.autosave_enabled = request.form.get(
            'autosave_enabled',
            user.autosave_enabled)
        db.session.add(user)
        db.sesison.commit()
        return jsonify({'status': 'OK'})

app.add_url_rule(
    '/api/v1/preferences',
    view_func=PreferencesAPI.as_view('preferences'))


class SiteSettingsAPI(MethodView):
    def get(self):
        user = current_user()
        if user is None:
            return redirect(url_for('authorized'))
        if not user.faculty:
            return abort(403)
        return jsonify({c.key: config.to_frontend_value(c) for c in SiteConfiguration.query.all()})

    def post(self):
        if current_user() is None:
            redirect(url_for('authorized'))
            user = current_user()
        if not user.faculty:
            return abort(403)
        key = request.form.get('key', None)
        value = request.form.get('value', None)
        try:
            try:
                config.set(key, config.from_frontend_value(key, json.loads(value)))
                return jsonify({'status': 'OK'})
            except ValueError:
                return abort(404)
        except:
            return abort(400)

app.add_url_rule(
    '/api/v1/site_settings',
    view_func=SiteSettingsAPI.as_view('site_settings'))
