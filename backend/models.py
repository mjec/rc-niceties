from datetime import datetime
from os import urandom

from backend import db


class User(db.Model):
    __tablename__ = 'user'

    # id is the RC user ID
    id = db.Column(db.Integer, primary_key=True, autoincrement=False)
    name = db.Column(db.String(500))
    avatar_url = db.Column(db.String(500), nullable=True)
    faculty = db.Column(db.Boolean)
    random_seed = db.Column(db.LargeBinary(32))

    def __init__(self, id, name, **kwargs):
        self.id = id
        self.name = name
        self.avatar_url = kwargs.get("avatar_url", None)
        self.faculty = kwargs.get("faculty", None)
        self.random_seed = urandom(32)

    def __repr__(self):
        return '<User:{} ({})>'.format(self.id, self.name)


class Nicety(db.Model):
    __tablename__ = 'nicety'

    id = db.Column(db.Integer, primary_key=True)
    end_date = db.Column(db.Date)
    author_id = db.Column(db.ForeignKey('user.id'))  # RC user ID
    target_id = db.Column(db.Integer)  # RC user ID
    anonymous = db.Column(db.Boolean)
    text = db.Column(db.Text, nullable=True)
    no_read = db.Column(db.Boolean)
    date_updated = db.Column(db.Text)

    __table_args__ = (db.UniqueConstraint(author_id, target_id, end_date),)

    def __init__(self, end_date, author_id, target_id, **kwargs):
        self.end_date = end_date
        self.author_id = author_id
        self.target_id = target_id
        self.anonymous = kwargs.get("anonymous", False)
        self.text = kwargs.get("text", None)
        self.no_read = kwargs.get("no_read", False)
        self.date_updated = kwargs.get("date_updated", "")

    def __repr__(self):
        return '<Nicety:{}>'.format(self.id)


class SiteConfiguration(db.Model):
    __tablename__ = 'site_configuration'

    key = db.Column(db.String(100), primary_key=True)
    value = db.Column(db.PickleType)

    def __init__(self, key, value):
        self.key = key
        self.value = value

    def __repr__(self):
        return '<Site Configuration:{}>'.format(self.key)


class Cache(db.Model):
    __tablename__ = 'cache'

    key = db.Column(db.String(100), primary_key=True)
    value = db.Column(db.PickleType)
    last_updated = db.Column(db.DateTime)

    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.last_updated = datetime.now()

    def __repr__(self):
        return '<Cache:{} ({})>'.format(self.key, self.last_updated)
