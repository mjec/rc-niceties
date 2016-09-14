from flask import json, jsonify, request, abort, url_for, redirect
from flask.views import MethodView
import random

from backend import app, rc, db
from backend.models import Nicety, SiteConfiguration
from backend.auth import current_user, needs_authorization
from datetime import datetime, timedelta
from sqlalchemy import func


from urllib.request import Request, urlopen
import backend.cache as cache
import backend.config as config
import backend.util as util

import sys

@app.route('/api/v1/niceties-to-print')
@needs_authorization
def niceties_to_print():
    ret = {}    # Mapping from target_id to a list of niceties for that person
    last_target = None
    # Loop through all the Niceties that exist for the open batch
    # The batch end date might be 6 weeks or more away, if you're doing a six week stint.
    # So that means it won't be picked up by .. which means it won't appear in the list to print!

    # this might need to be improve, possibly
    # 1) filter the niceties by the latest end_date
    # 2) ..
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
        return jsonify([
            {
                'to': json.loads(person(k).data)['name'],
                'niceties': v
            }
            for k, v in ret.items()
        ])
    else:
        return jsonify({'authorized': "false"})


@app.route('/api/v1/show-niceties')
@needs_authorization
def get_niceties_for_current_user():
    """Returns JSON list like:
    [
        {
            author_id: 0,   // target_id
            end_date: "",
            anonymous: true/false,
            text: "",
        },
        {
            author_id: int,
            end_date: "",
            anonymous: true/false,
            text: "",
        },
        ...
    ]
    """
    ret = []
    whoami = current_user().id
    two_weeks_from_now = datetime.now() - timedelta(days=14)
    valid_niceties = (Nicety.query
                      .filter(Nicety.end_date > datetime.now())
                      .filter(Nicety.target_id == whoami)
                      .all())
    for n in valid_niceties:
        if n.anonymous == True:
            store = {
                'end_date': n.end_date,
                'anonymous': n.anonymous,
                'text': n.text
            }
        else:
            store = {
                'avatar_url': json.loads(person(n.author_id).data)['avatar_url'],
                'author_id': n.author_id,
                'end_date': n.end_date,
                'anonymous': n.anonymous,
                'text': n.text
            }
        ret.append(store)
    return jsonify(ret)
    pass

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
                'bio': p['bio'],
                'interests': p['interests'],
                'before_rc': p['before_rc'],
                'during_rc': p['during_rc'],
                'job': p['job'],
                'twitter': p['twitter'],
                'github': p['github'],
            })
        cache.set(cache_key, people)
    random.seed(current_user().random_seed)
    random.shuffle(people)  # This order will be random but consistent for the user
    return jsonify(people)

@app.route('/api/v1/faculty')
@needs_authorization
def get_faculty():
    ''' faculty will always appear in
    the most recent batch!
    '''
    cache_key = 'faculty_list'
    try:
        faculty = cache.get(cache_key)
    except cache.NotInCache:
        faculty = []
        for open_batch in get_open_batches():
            for p in rc.get('batches/{}/people'.format(open_batch['id'])).data:
                if p['is_faculty']:
                    faculty.append({
                        'id': p['id'],
                        'name': util.name_from_rc_person(p),
                        'avatar_url': p['image'],
                        'stints': p['stints'],
                        'bio': p['bio'],
                        'interests': p['interests'],
                        'before_rc': p['before_rc'],
                        'during_rc': p['during_rc'],
                        'job': p['job'],
                        'twitter': p['twitter'],
                        'github': p['github'],
                    })
        cache.set(cache_key, faculty)
    return jsonify(faculty)

def get_users(batches):
    batches = rc.get('batches').data
    return [person for batch in batches for person in rc.get('batches/{}/people'.format(batch['id'])).data]

# private function
def get_current_batches():
    batches = rc.get('batches').data
    return [batch for batch in batches if util.end_date_within_range(batch['end_date'])]

def get_current_users():
    return get_users(get_current_batches())

# return tuple (X,Y), where X is people about to leave, Y is all else
def partition_current_users(users):
    ret = {}
    earliest_date = datetime.now()
    for u in users:
        print(u)
        for stint in u['stints']:
            user_date = datetime.strptime(stint['end_date'], '%Y-%m-%d')
            if user_date < earliest_date:
                earliest_date = user_date
        if user_date in ret:
            ret[user_date].append(u)
        elif user_date != None:
            ret[user_date] = [u]
    ret.pop(earliest_date)
    return ret

@app.route('/api/v1/test')
def test():
    return jsonify(partition_current_users(get_current_users()))

# return tuple (X,Y), where X is people about to leave, Y is current people not about to leave
def partition_users():
    users = get_users()
    pass

def get_current_batches():
    try:
        cache_key = 'open_batches_list'
        return cache.get(cache_key)
    except cache.NotInCache:
        batches = rc.get('batches').data
        print(batches)
        ret = []
        for batch in batches:
            if util.end_date_within_range(batch['end_date']):
                print(batch)
                batch['closing_time'] = util.batch_closing_time(batch['end_date']).isoformat()
                batch['warning_time'] = util.batch_closing_warning_time(batch['end_date']).isoformat()
                ret.append(batch)
        cache.set(cache_key, ret)
    return ret

@app.route('/api/v1/people')
@needs_authorization
def display_people():
    cache_key = 'people_list'
    try:
        people = cache.get(cache_key)
    except cache.NotInCache:
        people = []
        for open_batch in get_open_batches():
            for p in rc.get('batches/{}/people'.format(open_batch['id'])).data:
                latest_end_date = None
                for stint in p['stints']:
                    e = datetime.strptime(stint['end_date'], '%Y-%m-%d')
                    if latest_end_date is None or e > latest_end_date:
                        latest_end_date = e
                if (latest_end_date is not None and
                    util.end_date_within_range(latest_end_date) and
                    (   # Batchlings have   is_hacker_schooler = True,      is_faculty = False
                        # Faculty have      is_hacker_schooler = ?,         is_faculty = True
                        # Residents have    is_hacker_schooler = False,     is_faculty = False
                        (p['is_hacker_schooler'] and not p['is_faculty']) or
                        (not p['is_faculty'] and not p['is_hacker_schooler'] and config.get(config.INCLUDE_RESIDENTS, False)) or
                        (p['is_faculty'] and config.get(config.INCLUDE_FACULTY, False)))):
                    people.append({
                        'id': p['id'],
                        'name': util.name_from_rc_person(p),
                        'avatar_url': p['image'],
                        'end_date': '{:%Y-%m-%d}'.format(latest_end_date),
                        'job': p['job'],
                        'twitter': p['twitter'],
                        'github': p['github'],
                        'bio': p['bio'],
                        'interests': p['interests'],
                        'before_rc': p['before_rc'],
                        'during_rc': p['during_rc'],
                    })
        cache.set(cache_key, people)
    whoami = current_user().id
    #am_i_leaving =
    all_but_me = list(person for person in people if person['id'] != whoami)
    random.seed(current_user().random_seed)
    random.shuffle(all_but_me)  # This order will be random but consistent for the user
    for p in all_but_me:
        print(p['github'])
        if p['github'] is not None and p['github'] != "katur":
            try:
                abc = urlopen("https://api.github.com/users/{}/repos".format(p['github'])).read()
                p['placeholder'] = abc
            except:
                e = sys.exc_info()[:2]
                print(e)
        print("hiiiiii")
    return jsonify(all_but_me)

@app.route('/api/v1/github-repos')
@needs_authorization
def abc():
    return urlopen("https://api.github.com/users/katur/repos").read()

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
            'is_faculty': p['is_faculty'],
            'bio': p['bio'],
            'interests': p['interests'],
            'before_rc': p['before_rc'],
            'during_rc': p['during_rc'],
            'job': p['job'],
            'twitter': p['twitter'],
            'github': p['github'],
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

    def post(end_date, person_id):
        if current_user() is None:
            redirect(url_for('authorized'))
        nicety = (
            Nicety
            .query
            .filter_by(
                end_date=end_date,
                target_id=person_id,
                author_id=current_user().id)
            .one())
        nicety.anonymous = request.form.get("anonymous", current_user().anonymous_by_default)
        text = request.form.get("text").strip()
        if '' == text:
            text = None
        nicety.text = text
        nicety.faculty_reviewed = False
        db.session.commit()
        return jsonify({'status': 'OK'})

app.add_url_rule(
    '/api/v1/niceties/<int:end_date>/<int:person_id>',
    view_func=NicetyFromMeAPI.as_view('nicety_from_me'))

@app.route('/api/v1/post-niceties', methods=['POST'])
@needs_authorization
def save_niceties():
    """Expects JSON list like:
    [
        {
            target_id: 0,   // target_id
            end_date: "",
            anonymous: true/false,
            text: "",
        },
        {
            target_id: int,
            end_date: "",
            anonymous: true/false,
            text: "",
        },
        ...
    ]
    """
    niceties_to_save = json.loads(request.form.get("niceties", "[]"))
    for n in niceties_to_save:
        nicety = (
            Nicety
            .query      # Query is always about getting Nicety objects from the database
            .filter_by(
                end_date=datetime.strptime(n.get("end_date"), "%Y-%m-%d").date(),
                target_id=n.get("target_id"),
                author_id=current_user().id)
            .one_or_none())
        if nicety is None:
            nicety = Nicety(
                end_date=datetime.strptime(n.get("end_date"), "%Y-%m-%d").date(),
                target_id=n.get("target_id"),
                author_id=current_user().id)
            db.session.add(nicety)
            # We need to add for the new one, but we don't need to add where we have used .query
            # Now any change to the nicety object (variable) is tracked by the object
            # so it knows what it will have to update.
            # And then when we call db.session.commit() that knows about the object
            # (beacuse Nicety.query... uses the db.session behind the scenes).
            # So then db.session.commit() sends the update (or insert) for every object
            # in the session. This includes every object created by a [model].query and
            # everything added to the session with db.session.add().
        nicety.anonymous = n.get("anonymous", current_user().anonymous_by_default)
        text = n.get("text").strip()
        if '' == text:
            text = None
        nicety.text = text
        nicety.faculty_reviewed = False
    db.session.commit()
    return jsonify({'status': 'OK'})

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
