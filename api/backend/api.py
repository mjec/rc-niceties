from flask import json, jsonify, request, abort, url_for, redirect, session
from flask.views import MethodView
import random

from backend import app, rc, db
from backend.models import Nicety
from datetime import datetime, timedelta
from sqlalchemy import func

import backend.util as util

import sys
from functools import partial
from urllib.request import Request, urlopen
from operator import is_not

def cache_batches_call(request):
    res = util.authorized_request(request, '/batches')
    batches = res
    return batches

def cache_people_call(batch_id, request):
    people = []
    batches = util.authorized_reqest('batches/{}/people'.format(batch_id), request).data
    for p in batches:
        repo_info = []
        latest_end_date = None
        for stint in p['stints']:
            if stint['end_date'] is not None:
                e = datetime.strptime(stint['end_date'], '%Y-%m-%d')
                if latest_end_date is None or e > latest_end_date:
                    latest_end_date = e
        people.append({
            'id': p['id'],
            'is_faculty': p['is_faculty'],
            'is_hacker_schooler': p['is_hacker_schooler'],
            'name': util.name_from_rc_person(p),
            'full_name': util.full_name_from_rc_person(p),
            'avatar_url': p['image'],
            'stints': p['stints'],
            'bio': p['bio'],
            'interests': p['interests'],
            'before_rc': p['before_rc'],
            'during_rc': p['during_rc'],
            'job': p['job'],
            'twitter': p['twitter'],
            'github': p['github'],
            'repos': repo_info,
            'end_date': latest_end_date,
        })
    return people

def cache_person_call(person_id, request):
    p = util.authorized_request(request, '/people/{}'.format(person_id))
    # if 'message' in p:
    #     return redirect(url_for('login'))
    person_info = {
        'id': p['id'],
        'name': p['first_name'],
        'full_name': p['first_name'] + " " + p['last_name'],
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
    return person_info

def get_current_faculty(request):
    ''' faculty will always appear in
    the most recent batch!
    '''
    faculty = []
    for batch in get_current_batches_info():
        for p in cache_people_call(batch['id'], request):
            if p['is_faculty'] == True:
                faculty.append(p)
    return faculty

def get_current_batches_info(request):
    batches = cache_batches_call(request)
    ret = [batch for batch in batches if util.open_batches(batch['end_date'])]
    if not util.niceties_are_open(ret) or len(ret) == 1:
        ret = []
    return ret

def get_current_users(request):
    batches = get_current_batches_info(request)
    if batches != []:
        return [person for batch in batches for person  in cache_people_call(batch['id'], request)]
    else:
        return []

def partition_current_users(users):
    ret = {
        'staying': [],
        'leaving': []
    }
    user_stints = [user['stints'] for user in users]
    end_dates = []
    for stints in user_stints:
        if stints != []:
            for stint in stints:
                if stint['end_date'] is not None and stint['type'] == 'retreat':
                    end_dates.append(stint['end_date'])
    end_dates = sorted(list(set(end_dates)))
    end_dates = end_dates[::-1]
    staying_date = datetime.strptime(end_dates[0], "%Y-%m-%d")
    leaving_date = datetime.strptime(end_dates[1], "%Y-%m-%d")
    for u in users:
        if u['end_date'] == staying_date:
            ret['staying'].append(u)
        elif u['end_date'] == leaving_date:
            ret['leaving'].append(u)
        else:
            pass
    return ret

def current_user(request):
    me = util.authorized_request(request, '/people/me')
    return me

@app.route('/api/v1/people/<int:person_id>')
def get_person_info(person_id):
    person_info = cache_person_call(person_id, request)
    return jsonify(person_info)

@app.route('/api/v1/self')
def get_self_info():
    user = current_user(request)
    return jsonify(user)

@app.route('/api/v1/admin-edit-niceties', methods=['GET'])
def post_edited_niceties():
    ret = {}    # Mapping from target_id to a list of niceties for that person
    last_target = None
    is_rachel = util.admin_access(current_user(request))
    three_weeks_ago = datetime.now() - timedelta(days=21) 
    three_weeks_from_now = datetime.now() + timedelta(days=21)
    if is_rachel == True:
        valid_niceties = (Nicety.query
                          .filter(Nicety.end_date > three_weeks_ago)
                          .filter(Nicety.end_date < three_weeks_from_now)
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
                    'name': cache_person_call(n.author_id, request)['full_name'],
                    'no_read': n.no_read,
                    'text': util.decode_str(n.text),
                })
            else:
                ret[n.target_id].append({
                    'text': util.decode_str(n.text),
                    'no_read': n.no_read,
                })
        return jsonify([
            {
                'to_name': cache_person_call(k, request)['full_name'],
                'to_id': cache_person_call(k, request)['id'],
                'niceties': v
            }
            for k, v in ret.items()
        ])
    else:
        return jsonify({'authorized': "false"})

@app.route('/api/v1/admin-edit-niceties', methods=['POST'])
def get_niceties_to_edit():
    is_rachel = util.admin_access(current_user(request))
    nicety_text = util.encode_str(request.form.get("text"))
    nicety_author = request.form.get("author_id")
    nicety_target = request.form.get("target_id")
    if is_rachel == True:
        (Nicety.query
         .filter(Nicety.author_id==nicety_author)
         .filter(Nicety.target_id==nicety_target)
         .update({'text': nicety_text}))
        db.session.commit()
        return jsonify({'status': 'OK'})
    else:
        return jsonify({'authorized': "false"})

@app.route('/api/v1/niceties-from-me')
def niceties_from_me():
    user_id = current_user(request)['id']
    niceties = (Nicety.query
                .filter(Nicety.author_id == user_id)
                .all())
    ret = [{
        'target_id': n.target_id,
        'text': util.decode_str(n.text),
        'anonymous': n.anonymous,
        'no_read': n.no_read,
        'date_updated': n.date_updated
    } for n in niceties]
    return jsonify(ret)

@app.route('/api/v1/niceties-for-me')
def niceties_for_me():
    ret = []
    whoami = current_user(request)['id']
    two_weeks_from_now = datetime.now() - timedelta(days=14)
    valid_niceties = (Nicety.query
                      .filter(Nicety.end_date + timedelta(days=1) < datetime.now()) # show niceties one day after the end date
                      .filter(Nicety.target_id == whoami)
                      .all())
    for n in valid_niceties:
        if n.text != None:
            if n.anonymous == True:
                store = {
                    'end_date': n.end_date,
                    'anonymous': n.anonymous,
                    'text': util.decode_str(n.text),
                    'no_read': n.no_read,
                    'date_updated': n.date_updated
                }
            else:
                store = {
                    'avatar_url': cache_person_call(n.author_id, request)['avatar_url'],
                    'name': cache_person_call(n.author_id, request)['name'],
                    'author_id': n.author_id,
                    'end_date': n.end_date,
                    'anonymous': n.anonymous,
                    'text': util.decode_str(n.text),
                    'no_read': n.no_read,
                    'date_updated': n.date_updated
                }
            ret.append(store)
    return jsonify(ret)

@app.route('/api/v1/faculty')
def get_faculty():
    faculty = get_current_faculty(request)
    return jsonify(faculty)

@app.route('/api/v1/batches')
def get_all_batches():
    batches = cache_batches_call(request)
    return jsonify(batches)

@app.route('/api/v1/people')
def display_people():
    current = get_current_users(request)
    if current == []:
        return jsonify({'status': 'closed'})
    people = partition_current_users(current)
    user_id = current_user(request)['id']
    current_user_leaving = False
    leaving = []
    to_display = None
    for person in people['leaving']:
        if person['id'] == user_id:
            current_user_leaving = True
        else:
            leaving.append(person)
    staying = list(person for person in people['staying'])
    faculty = get_current_faculty(request)
    # there needs to be a better way to add special people to the current exiting batch
    special = [ x for x in faculty if x['id'] == 601]
    random.seed(current_user(request)['random_seed'])
    random.shuffle(staying)
    random.shuffle(leaving)
    random.shuffle(special)
    if current_user_leaving == True:
        to_display = {
            'staying': staying,
            'leaving': leaving,
            'special': special
        }
    else:
        to_display = {
            'leaving': leaving,
            'special': special
        }
    return jsonify(to_display)

@app.route('/api/v1/save-niceties', methods=['POST'])
def save_niceties():
    niceties_to_save = json.loads(request.form.get("niceties", "[]"))
    for n in niceties_to_save:
        nicety = (
            Nicety
            .query      # Query is always about getting Nicety objects from the database
            .filter_by(
                end_date=datetime.strptime(n.get("end_date"), "%Y-%m-%d").date(),
                target_id=n.get("target_id"),
                author_id=current_user(request)['id'])
            .one_or_none())
        if nicety is None:
            nicety = Nicety(
                end_date=datetime.strptime(n.get("end_date"), "%Y-%m-%d").date(),
                target_id=n.get("target_id"),
                author_id=current_user(request)['id'])
            db.session.add(nicety)
            # We need to add for the new one, but we don't need to add where we have used .query
            # Now any change to the nicety object (variable) is tracked by the object
            # so it knows what it will have to update.
            # And then when we call db.session.commit() that knows about the object
            # (beacuse Nicety.query... uses the db.session behind the scenes).
            # So then db.session.commit() sends the update (or insert) for every object
            # in the session. This includes every object created by a [model].query and
            # everything added to the session with db.session.add().
        nicety.anonymous = n.get("anonymous", current_user(request)['anonymous_by_default'])
        text = util.encode_str(n.get("text").strip())
        if '' == text:
            text = None
        nicety.text = text
        nicety.faculty_reviewed = False
        nicety.no_read = n.get("no_read")
        nicety.date_updated = n.get("date_updated")
    db.session.commit()
    return jsonify({'status': 'OK'})
