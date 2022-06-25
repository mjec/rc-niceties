"""populate profile, stint tables

Revision ID: 56600ad1ec09
Revises: 937feb66a82b
Create Date: 2022-03-06 13:50:27.748654

"""
from alembic import op

from sqlalchemy.sql import table, column
from sqlalchemy import String, Integer, Date

from dotenv import load_dotenv
from backend.models import Profile, Stint
from update_data import get_env_var, get_people

# revision identifiers, used by Alembic.
revision = "56600ad1ec09"
down_revision = "937feb66a82b"
branch_labels = None
depends_on = None


def upgrade():
    """
    Create new tables and models for Profiles and Stints, and populate
    them with the data from the RC API.

    Import functions from update_data.py. Following this
    migration, use the update_data.py module to pull all data from
    the RC API.
    """

    profile_table = table(
        "profile",
        column("profile_id", Integer),
        column("name", String),
        column("first_name", String),
        column("last_name", String),
        column("avatar_url", String),
        column("bio_rendered", String),
        column("interests", String),
        column("before_rc", String),
        column("during_rc", String),
    )

    stint_table = table(
        "stint",
        column("stint_id", Integer),
        column("profile_id", Integer),
        column("type_stint", String),
        column("start_date", Date),
        column("end_date", Date),
        column("title", String),
    )

    load_dotenv()
    token = get_env_var("RC_API_ACCESS_TOKEN")
    people = get_people(token)

    profiles_total = []
    stints_total = []

    for person in people:
        p = Profile(
            profile_id=person.get("id"),
            first_name=person.get("first_name"),
            last_name=person.get("last_name"),
            name=person.get("name"),
            avatar_url=person.get("image_path"),
            bio_rendered=person.get("bio_rendered"),
            interests=person.get("interests_rendered"),
            before_rc=person.get("before_rc_rendered"),
            during_rc=person.get("during_rc_rendered"),
        )
        profiles_total.append(p.__dict__)

        stints_person = person.get("stints")
        for stint in stints_person:
            s = Stint(
                stint_id=stint.get("id"),
                profile_id=p.profile_id,
                start_date=stint.get("start_date"),
                end_date=stint.get("end_date"),
                type_stint=stint.get("type"),
                title=stint.get("title"),
            )
            stints_total.append(s.__dict__)

    op.bulk_insert(profile_table, profiles_total)
    op.bulk_insert(stint_table, stints_total)


def downgrade():
    pass
