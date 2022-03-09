"""create stints for missing people

Revision ID: b49314aac7b0
Revises: 105986a70a5d
Create Date: 2022-02-07 23:55:08.293544

"""
from alembic import op
from sqlalchemy.sql import table, column
from sqlalchemy import String, Integer, Date
from datetime import timedelta

from backend.models import Stint


# revision identifiers, used by Alembic.
revision = "b49314aac7b0"
down_revision = "105986a70a5d"
branch_labels = None
depends_on = None


def upgrade():

    stint_table = table(
        "stint",
        column("stint_id", Integer),
        column("profile_id", Integer),
        column("type_stint", String),
        column("start_date", Date),
        column("end_date", Date),
        column("title", String),
    )

    connection = op.get_bind()

    """
    The 156 nicetys with null stint_ids can be grouped into 18 profiles
    with 18 end dates,

    Out of the 18 profiles, create stints for the newly created profiles
    using negative stint ids.

    Further details and clarifiation:
    9 new profiles manually created (4 Former Recurser's + 5 from Users table)
    2 profiles with no nicetys written for them. No need to create stints
    for them.
    This leaves 7 profiles with 8 stints: 2 stints for one profile

    After this, there will be 68 nicetys with null stint_ids left.
    This will be addressed in the next migration
    """

    ids_and_missmatched_end_dates = connection.execute(
        """
        SELECT target_id,
                end_date
        FROM nicety
        WHERE stint_id is null
        GROUP BY  target_id, end_date
        ORDER BY  target_id;
        """
    )

    new_profiles_without_stints = connection.execute(
        """
        SELECT profile_id
        FROM profile
        WHERE profile_id NOT IN
            (SELECT profile_id
            FROM stint);
        """
    )

    new_profiles_without_stints_ids = [i[0] for i in
                                       new_profiles_without_stints]

    counter = -1
    new_stints_for_new_profiles = []
    for target_id, end_date in ids_and_missmatched_end_dates:
        if target_id in new_profiles_without_stints_ids:
            s = Stint(
                stint_id=counter,
                profile_id=target_id,
                type_stint="retreat",
                start_date=end_date - timedelta(days=90),
                end_date=end_date,
            )
            new_stints_for_new_profiles.append(s.__dict__)
            counter -= 1
    op.bulk_insert(stint_table, new_stints_for_new_profiles)

    op.execute(
        """
        UPDATE nicety SET stint_id = stint.stint_id
        FROM stint
        WHERE nicety.target_id = stint.profile_id
                AND nicety.end_date = stint.end_date;
        """
    )


def downgrade():
    pass
