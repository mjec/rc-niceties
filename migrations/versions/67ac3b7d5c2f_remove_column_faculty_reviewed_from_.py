"""remove column faculty_reviewed from Nicety

Revision ID: 67ac3b7d5c2f
Revises: e88e0781857f
Create Date: 2021-06-25 13:00:46.937589

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "67ac3b7d5c2f"
down_revision = "e88e0781857f"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column("nicety", "faculty_reviewed")


def downgrade():
    op.add_column("nicety", sa.Column("faculty_reviewed", sa.Boolean(), nullable=True))
