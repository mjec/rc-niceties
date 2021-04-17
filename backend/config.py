from base64 import b64decode, b64encode

from backend import db
from backend.models import Nicety, SiteConfiguration

# Configuration keys
CACHE_TIMEOUT = 'default max age for cached data (datetime.timedelta)'
INCLUDE_FACULTY = 'permit niceties to be left about faculty (boolean)'
INCLUDE_RESIDENTS = 'permit niceties to be left about residents (boolean)'

# Memo table for get() memoization
memo = {}


def get(key, default=None, memoized=True):
    """Get a configuration value from the SiteConfiguration table, returning
    `default` if the value is not in the table. This value is memoized if it is
    retreived from the database, making repeated calls cheap. Memoization can be
    bypassed by passing `memoized=False` as a parameter."""
    if memoized and key in memo:
        return memo[key]
    db_row = SiteConfiguration.query.filter(SiteConfiguration.key == key).one_or_none()
    if db_row is None:
        return default
    memo[key] = db_row.value
    return memo[key]


def set(key, value):
    """Set a configuration value in the SiteConfiguration table."""
    db_row = SiteConfiguration.query.filter_by(key=key).one_or_none()
    if db_row is None:
        db_row = SiteConfiguration(key, value)
        db.session.add(db_row)
    else:
        db_row.value = value
    db.session.commit()
    memo[key] = value


def unset(key):
    """Remove a configuration value from the SiteConfiguration table."""
    if key in memo:
        del memo[key]
    (db
     .session
     .query(SiteConfiguration)
     .filter(key == key)
     .delete())
    db.session.commit()


def to_frontend_value(cfg):
    """Returns a JSON-serializable version of the value of the `SiteConfiguration`
    object `cfg`, applying any transformation reversed by from_frontend_value."""
    if cfg.key == CACHE_TIMEOUT:
        return cfg.value.total_seconds()
    elif cfg.key == INCLUDE_FACULTY:
        return cfg.value
    elif cfg.key == INCLUDE_RESIDENTS:
        return cfg.value
    else:
        return None


def from_frontend_value(key, value):
    """Returns a `SiteConfiguration` object value for the relevant `key` and
    JSON-serializable `value`, applying any transformation reversed by to_frontend_value."""
    if key == CACHE_TIMEOUT:
        from datetime import timedelta
        return timedelta(seconds=value)
    elif key == INCLUDE_FACULTY:
        return value
    elif key == INCLUDE_RESIDENTS:
        return value
    else:
        raise ValueError('No such config key!')


def set_to_default():
    import datetime
    set(CACHE_TIMEOUT, datetime.timedelta(days=7))
    set(INCLUDE_FACULTY, False)
    set(INCLUDE_RESIDENTS, False)
    db.session.commit()


def obfuscate_niceties():
    for nicety in Nicety.query.all():
        if nicety.text is not None:
            encode = nicety.text.encode('utf-8')
            new = b64encode(encode).decode('utf-8')
            if nicety.text == b64decode(new).decode('utf-8'):
                nicety.text = new
    db.session.commit()
