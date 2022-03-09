"""populate nicety.stints ids with latest stint

Revision ID: 6c02dd2c1a05
Revises: b49314aac7b0
Create Date: 2022-02-20 16:24:10.634770

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = "6c02dd2c1a05"
down_revision = "b49314aac7b0"
branch_labels = None
depends_on = None


def upgrade():
    """
    Populate stint_ids for 68 niceties where nicety.stint_id = null.
    All niceties happen to be written for the target_id's latest stint
    """

    op.execute(
        """
        WITH most_recent_stint AS
            (SELECT distinct
                ON (profile_id) last_value(stint_id)
                OVER wnd AS stint_id, profile_id
            FROM stint
            WINDOW wnd AS (PARTITION BY profile_id
            ORDER BY  end_date ASC rows
                BETWEEN UNBOUNDED PRECEDING
                    AND UNBOUNDED FOLLOWING)
            )

        UPDATE nicety SET stint_id = most_recent_stint.stint_id
        FROM most_recent_stint
        WHERE nicety.target_id = most_recent_stint.profile_id
                AND nicety.stint_id is null;
        """
    )


def downgrade():
    pass
