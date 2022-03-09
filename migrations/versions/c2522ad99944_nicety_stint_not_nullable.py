"""change nicety stint to nullable=False

Revision ID: c2522ad99944
Revises: 6c02dd2c1a05
Create Date: 2022-02-20 16:28:13.196108

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = "c2522ad99944"
down_revision = "6c02dd2c1a05"
branch_labels = None
depends_on = None


def upgrade():
    """
    Nicety.stint_id was allowed to be null while populating
    their values.

    Now that the 156 nicety.stint_ids are populated, this column
    won't be null again.
    """

    op.alter_column(table_name="nicety",
                    column_name="stint_id",
                    nullable=False)


def downgrade():

    op.alter_column(table_name="nicety",
                    column_name="stint_id",
                    nullable=True)
