from datetime import datetime, timedelta

import backend.config as config

batch_closing_time_memo = {}
batch_closing_warning_time_memo = {}


def batch_is_open(batch_id, end_date):
    """Returns `True` if and only if the specified batch is currently accepting
    niceties. The `batch_id` paramter should be an integer and `end_date` should
    be a datetime object or a string with format `%Y-%m-%d`."""
    if not isinstance(end_date, datetime):
        end_date = datetime.strptime(end_date, "%Y-%m-%d")
    opening_time = end_date - config.get(config.NICETIES_OPEN)
    closing_time = datetime.combine(
        (end_date - timedelta(days=1)).date(),
        config.get(config.CLOSING_TIME))
    now = datetime.now()
    return (
        int(batch_id) in config.get(config.CURRENTLY_ACCEPTING) and
        opening_time <= now and
        closing_time > now
    )


def batch_closing_time(end_date):
    """Returns a datetime of the closing time."""
    if not isinstance(end_date, datetime):
        end_date = datetime.strptime(end_date, "%Y-%m-%d")
    if end_date not in batch_closing_time_memo:
        batch_closing_time_memo[end_date] = datetime.combine(
            (end_date - timedelta(days=1)).date(),
            config.get(config.CLOSING_TIME))
    return batch_closing_time_memo[end_date]


def batch_closing_warning_time(end_date):
    """Returns a datetime of the closing time less the relevant closing buffer."""
    if end_date not in batch_closing_warning_time_memo:
        batch_closing_warning_time_memo[end_date] = (
            batch_closing_time(end_date) - config.get(config.CLOSING_BUFFER))
    return batch_closing_warning_time_memo[end_date]


def name_from_rc_person(person):
    """Returns a name as a string from an RC person object."""
    return '{} {}'.format(person['first_name'], person['last_name'])
