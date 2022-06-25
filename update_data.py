#!/usr/bin/env python

"""
Fetch and insert Recurse Center API data into database.
"""

import os
import logging
import sys
import requests
from dotenv import load_dotenv
from backend import db
from backend.models import Profile, Stint


def get_env_var(var_name, fallback=""):
    value = os.getenv(var_name) or fallback
    if not value:
        logging.error(
            f"{var_name} value not found.",
            " Ensure a .env or .flaskenv file is present",
            "with this environment variable set",
        )
        sys.exit()
    return value


def get_people(token):
    people = []
    session = requests.Session()
    session.headers.update({"Authorization": f"Bearer {token}"})
    url = "https://www.recurse.com/api/v1/profiles?limit={limit}&offset={offset}"
    limit = 50
    offset = 0

    while True:
        res = session.get(url.format(limit=limit, offset=offset))
        if res.status_code != requests.codes.ok:
            res.raise_for_status
        page = res.json()
        if page == []:
            break
        people.extend(page)
        offset += limit

    return people


def return_profile(profile_id):
    return Profile.query.filter_by(profile_id=profile_id).first()


def return_stint(stint_id):
    return Stint.query.filter_by(stint_id=stint_id).first()


def update_database(people):
    for person in people:
        # do person['id'] instead of the formatting below?
        profile_id = person.get("id")
        first_name = person.get("first_name")
        last_name = person.get("last_name")
        name = person.get("name")
        avatar_url = person.get("image_path")
        bio_rendered = person.get("bio_rendered")
        interests = person.get("interests_rendered")
        before_rc = person.get("before_rc_rendered")
        during_rc = person.get("during_rc_rendered")
        stints_all = person.get("stints")

        p = return_profile(profile_id)
        if p:
            p.profile_id = profile_id
            p.first_name = first_name
            p.last_name = last_name
            p.name = name
            p.avatar_url = avatar_url
            p.bio_rendered = bio_rendered
            p.interests = interests
            p.before_rc = before_rc
            p.during_rc = during_rc

            logging.info(f"Updating: {p.profile_id}, {p.name}")

        else:
            p = Profile(
                profile_id=profile_id,
                first_name=first_name,
                last_name=last_name,
                name=name,
                avatar_url=avatar_url,
                bio_rendered=bio_rendered,
                interests=interests,
                before_rc=before_rc,
                during_rc=during_rc,
            )

            logging.info(f"Adding: {p.profile_id}, {p.name}")

        stint_instances = create_stints(stints_all, p.profile_id)
        p.stints.extend(stint_instances)
        db.session.add(p)
        db.session.commit()
        verify_api_stints_match_database(stint_instances, p.profile_id)


def create_stints(stints_all, profile_id):
    stint_instances = []
    for stint in stints_all:
        stint_id = (stint["id"],)
        start_date = (stint["start_date"],)
        end_date = (stint["end_date"],)
        type_stint = (stint["type"],)
        title = stint["title"]

        s = return_stint(stint_id)
        if s:
            s.stint_id = stint_id
            s.start_date = start_date
            s.end_date = end_date
            s.type_stint = type_stint
            s.title = title

        else:
            s = Stint(
                stint_id=stint_id,
                profile_id=profile_id,
                start_date=start_date,
                end_date=end_date,
                type_stint=type_stint,
                title=title,
            )

        stint_instances.append(s)
    return stint_instances

def verify_api_stints_match_database(stint_instances, profile_id):
    """
    When a user decides to be a in different batch, the api will
    generate a new stint id.
    In that case, we need to delete the old stint from our database.
    """
    # number_of_stints_in_api = len(stint_instances)
    stints_in_database = Stint.query.filter_by(profile_id=profile_id).all()
    # print(f"equal to each other:{type(stint_instances) == type(stints_in_database)}")
    # print(f"stints_in_database: {stints_in_database}")



    stints_in_database_ids = [stint.stint_id for stint in stints_in_database]
    stints_in_api_ids = [stint.stint_id for stint in stint_instances]
    stints_in_database_ids.sort()
    stints_in_api_ids.sort()

    logging.info(f"stint_instances: {stint_instances}")
    logging.info(f"stints_in_database: {stints_in_database}")
    if stints_in_database_ids != stints_in_api_ids:
        for database_stint in stints_in_database:
            if database_stint not in stint_instances:
                db.session.delete(database_stint)
                db.session.commit()
    stints_in_database = Stint.query.filter_by(profile_id=profile_id).all()
    logging.info(f"stint_instances: {stint_instances}")
    logging.info(f"stints_in_database: {stints_in_database}")
    assert stints_in_database_ids == stints_in_api_ids, "Stints from API and database do not match up"





if __name__ == "__main__":

    load_dotenv()
    logging.basicConfig(level=logging.INFO)
    token = get_env_var("RC_API_ACCESS_TOKEN")

    logging.info("Starting database update...")
    people = get_people(token)
    logging.info(f"Found {len(people)} people")

    logging.info("Going through all profiles...")
    update_database(people)
    logging.info(f"Finished going through all {len(people)} profiles.")
