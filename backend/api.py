from flask import json, jsonify, session, request, abort, url_for, redirect
from flask.views import MethodView
import random

from backend import app, rc, db
from backend.models import Nicety, SiteConfiguration
import backend.cache as cache
import backend.config as config
import backend.util as util


@app.route('/api/v1/batches')
def batches():
    if session.get('user', None) is None:
        redirect(url_for('authorized'))
    try:
        return cache.get('batches_list')
    except cache.NotInCache:
        pass
    batches = rc.get('batches').data
    for batch in batches:
        if util.batch_is_open(batch['id'], batch['end_date']):
            batch['is_open'] = True
            batch['closing_time'] = util.batch_closing_time(batch.end_date).isoformat()
            batch['warning_time'] = util.batch_closing_warning_time(batch.end_date).isoformat()
        else:
            batch['is_open'] = False
            batch['closing_time'] = None
            batch['warning_time'] = None
    cache.set('batches_list', jsonify(batches))
    return cache.get('batches_list')


@app.route('/api/v1/batch_ids/with_niceties_from_me')
def batches_with_niceties_from_me():
    if session.get('user', None) is None:
        redirect(url_for('authorized'))
    return jsonify([
        n.batch_id
        for n in (
            Nicety
            .query
            .filter(Nicety.author_id == session.get('user').id)
            .all())
    ])


@app.route('/api/v1/batch_ids/with_niceties_to_me')
def batches_with_niceties_to_me():
    return jsonify([
        n.batch_id
        for n in (
            Nicety
            .query
            .filter(Nicety.target_id == session.get('user').id)
            .all())
    ])


@app.route('/api/v1/batches/<int:batch_id>/people')
def batch_people(batch_id):
    if session.get('user', None) is None:
        redirect(url_for('authorized'))
    cache_key = 'batches_people_list:{}'.format(batch_id)
    try:
        people = cache.get(cache_key)
    except cache.NotInCache:
        people = []
        for p in rc.get('batches/{}/people'.format(batch_id)).data:
            people.append({
                'id': p['id'],
                'name': util.name_from_rc_person(p),
                'avatar_url': p['image'],
            })
    random.seed(session.get('user').random_seed)
    random.shuffle(people)  # This order will be random but consistent for the user
    return jsonify(people)


@app.route('/api/v1/people/<int:person_id>')
def person(person_id):
    if session.get('user', None) is None:
        redirect(url_for('authorized'))
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
        cache.set(cache_key, jsonify(person))
    return cache.get(cache_key)


class NicetyFromMeAPI(MethodView):
    def get(batch_id, person_id):
        if session.get('user', None) is None:
            redirect(url_for('authorized'))
        try:
            nicety = (
                Nicety
                .query
                .filter_by(
                    batch_id=batch_id,
                    target_id=person_id,
                    author_id=session.get('user').id)
                .one())
        except db.exc.NoResultFound:
            nicety = Nicety(
                batch_id=batch_id,
                target_id=person_id,
                author_id=session.get('user').id,
                anonymous=session.get('user').anonymous_by_default)
            db.session.add(nicety)
            db.session.commit()
        return jsonify(nicety.__dict__)

    def post(batch_id, person_id):
        if session.get('user', None) is None:
            redirect(url_for('authorized'))
        nicety = (
            Nicety
            .query
            .filter_by(
                batch_id=batch_id,
                target_id=person_id,
                author_id=session.get('user').id)
            .one())
        nicety.anonymous = request.form.get("anonymous", session.get('user').anonymous_by_default)
        text = request.form.get("text").trim()
        if '' == text:
            text = None
        nicety.text = text
        nicety.faculty_reviewed = False
        db.session.commit()
        return jsonify({'status': 'OK'})

app.add_url_rule(
    '/api/v1/niceties/<int:batch_id>/<int:person_id>',
    view_func=NicetyFromMeAPI.as_view('nicety_from_me'))


class PreferencesAPI(MethodView):
    def get(self):
        if session.get('user', None) is None:
            redirect(url_for('authorized'))
        user = session.get('user')
        return jsonify({
            'anonymous_by_default': user.anonymous_by_default,
            'autosave_timeout': user.autosave_timeout,
            'autosave_enabled': user.autosave_enabled,
        })

    def post(self):
        if session.get('user', None) is None:
            redirect(url_for('authorized'))
        user = session.get('user')
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
        if session.get('user', None) is None:
            redirect(url_for('authorized'))
        user = session.get('user')
        if not user.is_faculty:
            return abort(403)
        return jsonify({c.key: config.to_frontend_value(c) for c in SiteConfiguration.query.all()})

    def post(self):
        if session.get('user', None) is None:
            redirect(url_for('authorized'))
        user = session.get('user')
        if not user.is_faculty:
            return abort(403)
        key = request.form.get('key', None)
        value = request.form.get('value', None)
        try:
            value = config.from_frontend_value(key, json.loads(value))
            if value is not None:
                SiteConfiguration.get(key).value = value
                db.session.commit()
                return jsonify({'status': 'OK'})
            else:
                return abort(404)
        except:
            return abort(400)

app.add_url_rule(
    '/api/v1/site_settings',
    view_func=SiteSettingsAPI.as_view('site_settings'))
