from datetime import datetime, time, timedelta

import backend.config as config

batch_closing_time_memo = {}
batch_closing_warning_time_memo = {}

def end_date_within_range(end_date):
    """Returns `True` if and only if the specified batch is currently accepting
    niceties. The `end_date` should
    be a datetime object or a string with format `%Y-%m-%d`."""
    if not isinstance(end_date, datetime):
        end_date = datetime.strptime(end_date, "%Y-%m-%d")
    closing_time = datetime.combine(
        (end_date - timedelta(days=1)).date(),
        config.get(config.CLOSING_TIME, time(hour=23, minute=0)))
    now = datetime.now()
    return (closing_time > now)

def batch_is_open(end_date):
    """Returns `True` if and only if the specified batch is currently accepting
    niceties. The `end_date` should
    be a datetime object or a string with format `%Y-%m-%d`."""
    return end_date_within_range(end_date)

def batch_closing_time(end_date):
    """Returns a datetime of the closing time."""
    if not isinstance(end_date, datetime):
        end_date = datetime.strptime(end_date, "%Y-%m-%d")
    if end_date not in batch_closing_time_memo:
        batch_closing_time_memo[end_date] = datetime.combine(
            (end_date - timedelta(days=1)).date(),
            config.get(config.CLOSING_TIME, time(hour=23, minute=0)))
    print(batch_closing_time_memo[end_date])
    return batch_closing_time_memo[end_date]

def batch_closing_warning_time(end_date):
    """Returns a datetime of the closing time less the relevant closing buffer."""
    if end_date not in batch_closing_warning_time_memo:
        batch_closing_warning_time_memo[end_date] = (
            batch_closing_time(end_date) -
            config.get(config.CLOSING_BUFFER, timedelta(minutes=30)))
    return batch_closing_warning_time_memo[end_date]

def name_from_rc_person(person):
    """Returns a name as a string from an RC person object."""
    return person['first_name']
    #return '{} {}'.format(person['first_name'], person['last_name'])
