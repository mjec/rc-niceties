from datetime import datetime
from os import urandom

from backend import db


class Profile(db.Model):
    __tablename__ = 'profile'

    profile_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(500), nullable=False)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    avatar_url = db.Column(db.String(500))
    bio_rendered = db.Column(db.String)
    interests = db.Column(db.String)
    before_rc = db.Column(db.String)
    during_rc = db.Column(db.String)
    stints = db.relationship("Stint", backref="profile")

    def __repr__(self):
        return '<Profile:{} ({})'.format(self.profile_id, self.name)


class Stint(db.Model):
    __tablename__ = 'stint'

    stint_id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.ForeignKey("profile.profile_id"), nullable=False)
    type_stint = db.Column(db.String, nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    title = db.Column(db.String)

    __table_args__ = (db.UniqueConstraint(profile_id, start_date),)

    def __repr__(self):
        return '<Stint:{}>'.format(self.stint_id)


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

    nicety_id = db.Column(db.Integer, primary_key=True, nullable=False)
    author_id = db.Column(db.ForeignKey("user.id"))  # RC user ID
    target_id = db.Column(db.ForeignKey("profile.profile_id"))  # RC user ID
    end_date = db.Column(db.Date)
    anonymous = db.Column(db.Boolean)
    text = db.Column(db.Text, nullable=True)
    no_read = db.Column(db.Boolean)
    date_updated = db.Column(db.Text)
    stint_id = db.Column(db.ForeignKey("stint.stint_id"))

    __table_args__ = (db.UniqueConstraint(author_id, target_id, stint_id),)

    def __init__(self, end_date, nicety_id, author_id, target_id, stint_id, **kwargs):
        self.end_date = end_date
        self.nicety_id = nicety_id
        self.author_id = author_id
        self.target_id = target_id
        self.stint_id = stint_id
        self.anonymous = kwargs.get("anonymous", False)
        self.text = kwargs.get("text", None)
        self.no_read = kwargs.get("no_read", False)
        self.date_updated = kwargs.get("date_updated", "")

    def __repr__(self):
        return '<Nicety:{}>'.format(self.nicety_id)


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
