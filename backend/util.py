from datetime import datetime, time, date, timedelta

from backend import app
import backend.config as config

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

def niceties_are_open(latest_batches):
    '''
    Takes a list of the latest batches and determines whether
    the window for writing niceties is open or not
    '''
    now = datetime.now()
    for batch in latest_batches:
        end_date = batch['end_date']
        if not isinstance(end_date, datetime):
            end_date = datetime.strptime(end_date, "%Y-%m-%d")
        window_open = end_date - timedelta(days=7)
        if now > window_open and end_date > now:
            return True
    return True #False

def name_from_rc_person(person):
    '''
    Returns a name as a string from an RC person object.
    '''
    return person['first_name']
    #return '{} {}'.format(person['first_name'], person['last_name'])

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
    #print(time_left.days, time_left.seconds)
    return end_date

def admin_access(current_user):
    if app.config.get('DEV') == 'TRUE':
        return True
    else:
        return current_user().id == 770
