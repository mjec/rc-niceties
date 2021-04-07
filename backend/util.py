from base64 import b64decode, b64encode
from datetime import datetime, time

from backend import app

batch_closing_time_memo = {}
batch_closing_warning_time_memo = {}


def open_batches(end_date):
    '''
    Returns `True` if and only if the specified batch is currently accepting
    niceties. The `end_date` should
    be a datetime object or a string with format `%Y-%m-%d`.
    '''
    if not isinstance(end_date, datetime):
        end_date = datetime.strptime(end_date, "%Y-%m-%d")
    closing_time = datetime.combine(end_date, time(hour=10, minute=0))
    now = datetime.now()
    return (closing_time > now)


def name_from_rc_person(person):
    '''
    Returns a name as a string from an RC person object.
    '''
    return person['first_name']


def full_name_from_rc_person(person):
    '''
    Returns a name as a string from an RC person object.
    '''
    return '{} {}'.format(person['first_name'], person['last_name'])


def next_window(latest_batches):
    '''
    Takes a list of the latest batches and determines how long more to
    when the niceties window is open for writing.
    '''
    now = datetime.now()
    earliest_end_date = None
    for batch in latest_batches:
        e = datetime.strptime(batch['end_date'], '%Y-%m-%d')
        if earliest_end_date is None or e < earliest_end_date:
            earliest_end_date = e
    time_left = earliest_end_date - now

    return time_left


def profile_is_faculty(profile):
    for stint in profile['stints']:
        if stint['type'] in ['employment', 'facilitatorship'] and stint['end_date'] is None:
            return True
    return False


def admin_access(current_user):
    if app.config.get('DEV') == 'TRUE' or current_user.id == 770 or current_user.id == 1804:
        return True
    else:
        return False


def encode_str(inp):
    if inp is None:
        return None
    return b64encode(inp.encode('utf-8')).decode('utf-8')


def decode_str(inp):
    if inp is None:
        return None
    return b64decode(inp).decode('utf-8')
