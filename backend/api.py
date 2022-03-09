import random
from datetime import datetime, timedelta

import backend.cache as cache
import backend.config as config
import backend.util as util
from backend import app, db, rc
from backend.auth import current_user, needs_authorization
from backend.models import Nicety, SiteConfiguration
from flask import abort, json, jsonify, redirect, request, url_for
from flask.views import MethodView


def format_info(p):
    latest_end_date = None
    is_recurser = False
    for stint in p['stints']:
        if stint['end_date']:
            is_recurser = True
            e = datetime.strptime(stint['end_date'], '%Y-%m-%d')
            if latest_end_date is None or e > latest_end_date:
                latest_end_date = e

    repo_info = []
    # if p['github']:
    #     repos = json.loads(urlopen("https://api.github.com/users/{}/repos".format(p['github'])).read())
    #     for repo in repos:
    #         repo_info.append({'name': repo['name'],
    #                           'description': repo['description'],
    #                           })

    if p['interests_rendered']:
        placeholder = util.name_from_rc_person(p) + " is interested in: " + p['interests_hl']
    else:
        placeholder = "Say something nice about " + util.name_from_rc_person(p) + "!"

    person_info = {
        'id': p['id'],
        'name': util.name_from_rc_person(p),
        'full_name': util.full_name_from_rc_person(p),
        'avatar_url': p['image_path'],
        'bio': p['bio_rendered'],
        'interests': p['interests_rendered'],
        'before_rc': p['before_rc_rendered'],
        'during_rc': p['during_rc_rendered'],
        'job': p['employer_info_rendered'],
        'twitter': p['twitter'],
        'github': p['github'],
        'stints': p['stints'],
        'repos': repo_info,
        'end_date': latest_end_date,
        'placeholder': placeholder,
        'is_recurser': is_recurser,
        'is_faculty': util.profile_is_faculty(p),
    }

    return person_info


def cache_batches_call():
    res = rc.get('batches').data
    return res


def cache_people_call(batch_id):
    people = []
    batch = rc.get('profiles?batch_id={}'.format(batch_id)).data
    for p in batch:
        people.append(format_info(p))

    return people


def cache_person_call(person_id):
    p = rc.get('profiles/{}'.format(person_id)).data
    return format_info(p)


def get_current_faculty():
    f = rc.get('profiles?role=faculty').data
    return [
        format_info(profile)
        for profile in f
        if util.profile_is_faculty(profile)
    ]


def get_current_batches_info():
    batches = cache_batches_call()
    ret = [batch for batch in batches if util.open_batches(batch['end_date'])]
    return ret


def get_current_users():
    batches = get_current_batches_info()
    if batches != []:
        return [person for batch in batches for person in cache_people_call(batch['id'])]
    else:
        return []


def partition_current_users(users):
    ret = {
        'staying': [],
        'leaving': []
    }
    user_stints = [user['stints'] for user in users]
    twelve_weeks = datetime.today() + timedelta(weeks=12)
    end_dates = []
    for stints in user_stints:
        if stints != []:
            for stint in stints:
                if stint['type'] == 'retreat' and datetime.strptime(stint['end_date'], "%Y-%m-%d") <= twelve_weeks:
                    end_dates.append(stint['end_date'])
    end_dates = sorted(list(set(end_dates)))
    end_dates = end_dates[::-1]
    staying_date = datetime.strptime(end_dates[0], "%Y-%m-%d")
    leaving_date = datetime.strptime(end_dates[1], "%Y-%m-%d")
    for u in users:
        # Batchlings have   is_recurser = True,      is_faculty = False
        # Faculty have      is_recurser = ?,         is_faculty = True
        # Residents have    is_recurser = False,     is_faculty = False
        if ((u['is_recurser'] and not u['is_faculty']) or
            (not u['is_faculty'] and not u['is_recurser'] and config.get(config.INCLUDE_RESIDENTS, False)) or
                (u['is_faculty'] and config.get(config.INCLUDE_FACULTY, False))):
            if u['end_date'] == staying_date:
                ret['staying'].append(u)
            elif u['end_date'] == leaving_date:
                ret['leaving'].append(u)
            else:
                pass
    return ret


@app.route('/api/v1/people/<int:person_id>')
@needs_authorization
def get_person_info(person_id):
    person_info = cache_person_call(person_id)
    return jsonify(person_info)


@app.route('/api/v1/self')
@needs_authorization
def get_self_info():
    admin = util.admin_access(current_user())
    data = {
        'admin': admin
    }
    return jsonify(data)


@app.route('/api/v1/admin-edit-niceties', methods=['GET'])
@needs_authorization
def get_admin_niceties():
    ret = {}    # Mapping from target_id to a list of niceties for that person
    last_target = None
    is_admin = util.admin_access(current_user())
    three_weeks_ago = datetime.now() - timedelta(days=21)
    three_weeks_from_now = datetime.now() + timedelta(days=21)
    if is_admin is True:
        if app.config.get("DEBUG_SHOW_ALL") == "TRUE":
            valid_niceties = (Nicety.query
                              .filter(Nicety.end_date > three_weeks_ago)
                              .order_by(Nicety.target_id)
                              .all())
        else:
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
            if n.anonymous is False:
                ret[n.target_id].append({
                    'author_id': n.author_id,
                    'name': cache_person_call(n.author_id)['full_name'],
                    'end_date': n.end_date,
                    'no_read': n.no_read,
                    'text': util.decode_str(n.text),
                })
            else:
                ret[n.target_id].append({
                    'author_id': n.author_id,
                    'end_date': n.end_date,
                    'no_read': n.no_read,
                    'text': util.decode_str(n.text),
                })
        return jsonify([
            {
                'to_name': cache_person_call(k)['full_name'],
                'to_id': cache_person_call(k)['id'],
                'niceties': v
            }
            for k, v in ret.items()
        ])
    else:
        return jsonify({'authorized': "false"})


@app.route('/api/v1/niceties-from-me')
@needs_authorization
def niceties_from_me():
    user_id = current_user().id
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
@needs_authorization
def niceties_for_me():
    ret = []
    whoami = current_user().id
    if app.config.get("DEBUG_SHOW_ALL") == "TRUE":
        valid_niceties = (Nicety.query
                          .all())
    else:
        valid_niceties = (Nicety.query
                          .filter(Nicety.end_date + timedelta(days=1) < datetime.now())  # show niceties one day after the end date
                          .filter(Nicety.target_id == whoami)
                          .all())
    for n in valid_niceties:
        if n.text is not None:
            if n.anonymous is True:
                store = {
                    'end_date': n.end_date,
                    'anonymous': n.anonymous,
                    'text': util.decode_str(n.text),
                    'no_read': n.no_read,
                    'date_updated': n.date_updated
                }
            else:
                store = {
                    'avatar_url': cache_person_call(n.author_id)['avatar_url'],
                    'name': cache_person_call(n.author_id)['name'],
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
@needs_authorization
def get_faculty():
    faculty = get_current_faculty()
    return jsonify(faculty)


@app.route('/api/v1/batches')
def get_all_batches():
    batches = cache_batches_call()
    return jsonify(batches)


@app.route('/api/v1/people')
@needs_authorization
def display_people():
    current = get_current_users()
    people = partition_current_users(current)
    user_id = current_user().id

    leaving = [person for person in people['leaving'] if person['id'] != user_id]
    staying = [person for person in people['staying'] if person['id'] != user_id]

    random.seed(current_user().random_seed)
    random.shuffle(staying)
    random.shuffle(leaving)
    to_display = {
        'staying': staying,
        'leaving': leaving,
        'faculty': get_current_faculty()
    }

    return jsonify(to_display)


@app.route('/api/v1/save-niceties', methods=['POST'])
@needs_authorization
def save_niceties():
    niceties_to_save = request.get_json()
    for n in niceties_to_save["niceties"]:
        if n.get('end_date'):
            end_date = datetime.strptime(n.get("end_date"), "%Y-%m-%d").date()
        else:
            end_date = None
        nicety = (
            Nicety
            .query      # Query is always about getting Nicety objects from the database
            .filter_by(
                end_date=end_date,
                target_id=n.get("target_id"),
                author_id=current_user().id)
            .one_or_none())
        if nicety is None:
            nicety = Nicety(
                end_date=end_date,
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
        text = util.encode_str(n.get("text").strip())
        if '' == text:
            text = None
        nicety.text = text
        nicety.no_read = n.get("no_read")
        nicety.date_updated = n.get("date_updated")
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
