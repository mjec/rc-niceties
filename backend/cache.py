import datetime

from backend import config, db
from backend.models import Cache


class NotInCache(Exception):
    pass


def get(key, max_age=None):
    """Get a value from the cache, provided it is no  older than `max_age`, which
    can be a `datetime.timedelta` or a number of seconds. If the item is not in the
    cache, raises a `NotInCache` exception."""
    if max_age is None:
        max_age = config.get(config.CACHE_TIMEOUT, datetime.timedelta(seconds=60 * 60 * 24))
    elif not isinstance(max_age, datetime.timedelta):
        max_age = datetime.timedelta(seconds=max_age)
    db_row = Cache.query.filter(
        Cache.key == key,
        Cache.last_updated >= (datetime.datetime.now() - max_age)).one_or_none()
    if db_row is None:
        raise NotInCache
    return db_row.value


def set(key, value):
    """Set a value in the cache."""
    db_row = Cache.query.filter_by(key=key).one_or_none()
    if db_row is None:
        db_row = Cache(key, value)
        db.session.add(db_row)
    else:
        db_row.value = value
    db_row.last_updated = datetime.datetime.now()
    db.session.commit()


def flush_expired(max_age=None):
    """Remove items from the cache which are older than `max_age`, which can be a
    `datetime.timedelta` or a number of seconds."""
    if max_age is None:
        max_age = config.get(config.CACHE_TIMEOUT, datetime.timedelta(seconds=60 * 60 * 24))
    elif not isinstance(max_age, datetime.timedelta):
        max_age = datetime.timedelta(seconds=max_age)
    (db
     .session
     .query(Cache)
     .filter(Cache.last_updated >= (datetime.datetime.now() + max_age))
     .delete())
    db.session.commit()


def flush_all():
    """Remove all items from the cache."""
    (db
     .session
     .query(Cache)
     .delete())
    db.session.commit()
