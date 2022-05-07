"""remove anonymous columns

Revision ID: 689a6ce963c3
Revises: c79589787f2f
Create Date: 2022-03-08 21:27:44.689439

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '689a6ce963c3'
down_revision = 'c79589787f2f'
branch_labels = None
depends_on = None


def upgrade():
    """
    Giving niceties anonymously in bulk is a partially implemented
    feature for the user.

    Ultimately want to discourage this feature as well as make it easier for
    code maintenance.
    """
    op.drop_column("user", "anonymous_by_default")

def downgrade():
    op.add_column("user", sa.Column("anonymous_by_default", sa.Boolean(),))
