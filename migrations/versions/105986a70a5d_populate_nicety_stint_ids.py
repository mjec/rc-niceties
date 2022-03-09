"""populate nicety.stint_ids based on nicety.end_dates

Revision ID: 105986a70a5d
Revises: ab2afff62bc6
Create Date: 2022-02-21 13:45:48.279043

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "105986a70a5d"
down_revision = "ab2afff62bc6"
branch_labels = None
depends_on = None


def upgrade():
    """
    Populate all nicety.stint_ids based on their end dates since it's
    a required column. This will exclude 156 niceties due to mismatching
    end dates.

    These 156 niceties with null stint_ids will be addresed over the
    next migration.
    """

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
