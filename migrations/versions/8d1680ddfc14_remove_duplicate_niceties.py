"""remove two duplicate niceties

Revision ID: 8d1680ddfc14
Revises: 689a6ce963c3
Create Date: 2022-01-20 19:11:18.433206

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = "8d1680ddfc14"
down_revision = "689a6ce963c3"
branch_labels = None
depends_on = None


def upgrade():
    """
    Delete 2 niceties that break the unique constraint
    "nicety_author_id_target_id_stint_id_key"
    """

    op.execute(
        """
        DELETE
        FROM nicety
        WHERE id IN (221, 3634);
        """
    )


def downgrade():
    pass
