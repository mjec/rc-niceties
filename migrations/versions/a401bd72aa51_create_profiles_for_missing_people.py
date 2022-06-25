"""create profiles for missing people

Revision ID: a401bd72aa51
Revises: 56600ad1ec09
Create Date: 2022-02-19 17:21:24.099557

"""
from alembic import op

from sqlalchemy.sql import table, column
from sqlalchemy import String, Integer

from backend.models import Profile


# revision identifiers, used by Alembic.
revision = "a401bd72aa51"
down_revision = "56600ad1ec09"
branch_labels = None
depends_on = None


def upgrade():
    """
    Create Profiles for:

    - 5 people: ids missing from the Profile table but found in
      the User table

    - 4 people: ids missing from both User and Profile tables.
      Save their names as "Former Recurser".
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

    connection = op.get_bind()

    op.execute(
        """
        INSERT INTO profile
        (profile_id, name, avatar_url)
        SELECT id, name, avatar_url
        FROM "user"
        WHERE "user".id NOT IN (SELECT profile_id FROM profile);
        """
    )

    missing_ids = connection.execute(
        """
        SELECT DISTINCT target_id
        FROM nicety
        WHERE target_id NOT IN (SELECT profile_id FROM profile);
        """
    )

    missing_target_ids = []
    for row in missing_ids:
        p = Profile(profile_id=row[0], name="Former Recurser")
        missing_target_ids.append(p.__dict__)
    op.bulk_insert(profile_table, missing_target_ids)


def downgrade():
    pass
