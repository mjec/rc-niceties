from datetime import datetime

from backend import db


class Nicety(db.Model):
    __tablename__ = 'niceties'

    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer)  # RC User ID
    target_id = db.Column(db.Integer)  # RC User ID
    anonymous = db.Column(db.Boolean)
    text = db.Column(db.Text, nullable=True)
    no_read = db.Column(db.Boolean)
    date_created = db.Column(db.Date)
    date_updated = db.Column(db.Date)

    def __init__(self, author_id, target_id, **kwargs):
        self.author_id = author_id
        self.target_id = target_id
        self.text = kwargs.get("text", None)
        self.anonymous = kwargs.get("anonymous", False)
        self.no_read = kwargs.get("no_read", False)
        self.date_created = kwargs.get("date_created", datetime.now())
        self.date_updated = kwargs.get("date_updated", datetime.now())

    def __repr__(self):
        return '<Nicety:{}>'.format(self.id)

class ActiveRecurser(db.Model):
    __tablename__ = 'active_recursers'

    id = db.Column(db.Integer, primary_key=True)

    def __repr__(self):
        return '<Active Recurser:{}>'.format(self.id)

class AdminSetting(db.Model):
    __tablename__ = 'admin_settings'

    key = db.Column(db.String(100), primary_key=True)
    value = db.Column(db.PickleType)

    def __init__(self, key, value):
        self.key = key
        self.value = value

    def __repr__(self):
        return '<Admin Setting:{}>'.format(self.key)

