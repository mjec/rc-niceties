"""remove unused columns from nicety and user tables

Revision ID: c79589787f2f
Revises: 67ac3b7d5c2f
Create Date: 2022-01-20 18:36:18.328917

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "c79589787f2f"
down_revision = "67ac3b7d5c2f"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column("nicety", "starred")
    op.drop_column("user", "autosave_enabled")
    op.drop_column("user", "autosave_timeout")


def downgrade():
    op.add_column(
        "nicety",
        sa.Column("starred", sa.BOOLEAN(), nullable=True),
    )
    op.add_column(
        "user",
        sa.Column("autosave_enabled", sa.BOOLEAN(), nullable=True),
    )
    op.add_column(
        "user",
        sa.Column("autosave_timeout", sa.INTEGER(), nullable=True),
    )
