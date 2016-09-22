from datetime import datetime, time, timedelta

import backend.config as config

batch_closing_time_memo = {}
batch_closing_warning_time_memo = {}

def latest_batches(end_date):
    """Returns `True` if and only if the specified batch is currently accepting
    niceties. The `end_date` should
    be a datetime object or a string with format `%Y-%m-%d`."""
    if not isinstance(end_date, datetime):
        end_date = datetime.strptime(end_date, "%Y-%m-%d")
    closing_time = datetime.combine(
        (end_date + timedelta(days=1)).date(),
        #(end_date - timedelta(days=1)).date(),
        config.get(config.CLOSING_TIME, time(hour=18, minute=0))
    )
    now = datetime.now()
    return (closing_time > now)

def name_from_rc_person(person):
    """Returns a name as a string from an RC person object."""
    return person['first_name']
    #return '{} {}'.format(person['first_name'], person['last_name'])

def full_name_from_rc_person(person):
    """Returns a name as a string from an RC person object."""
    return '{} {}'.format(person['first_name'], person['last_name'])
