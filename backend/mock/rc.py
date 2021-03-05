import os
import re
from types import SimpleNamespace

from backend import app
from flask import json, redirect, url_for


class MockRCOAuthAPI(object):
    url_matches = [
        (re.compile('batches'), 'comments.json'),
        (re.compile('people/me'), 'people_me.json'),
        (re.compile('people/(\d+)'), 'people_me.json'),
        (re.compile('batches/(\d+)/people'), 'batches_people.json'),
    ]

    def get(self, url):
        for matcher in self.url_matches:
            if matcher[0].fullmatch(url):
                return SimpleNamespace(data=json.load(
                    open(os.path.join(app.root_path, 'mock/fixtures/' + matcher[1]))
                ))
        return SimpleNamespace(data={})

    def authorize(self, callback=None, *args, **kwargs):
        if callback:
            return redirect(callback)
        return redirect(url_for('home'))

    def authorized_response(self, *args, **kwargs):
        return {
            'access_token': 'MOCK_ACCESS_TOKEN',
        }

    @staticmethod
    def tokengetter(f, *args, **kwargs):
        """Noop decorator"""
        return f
