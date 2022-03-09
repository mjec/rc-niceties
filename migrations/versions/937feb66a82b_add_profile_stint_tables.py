"""create profile, stint tables

Revision ID: 937feb66a82b
Revises: 8d1680ddfc14
Create Date: 2021-10-04 10:35:09.209325

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "937feb66a82b"
down_revision = "8d1680ddfc14"
branch_labels = None
depends_on = None


def upgrade():

    op.create_table(
        "profile",
        sa.Column("profile_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=500), nullable=False),
        sa.Column("first_name", sa.String(), nullable=True),
        sa.Column("last_name", sa.String(), nullable=True),
        sa.Column("avatar_url", sa.String(length=500), nullable=True),
        sa.Column("bio_rendered", sa.String(), nullable=True),
        sa.Column("interests", sa.String(), nullable=True),
        sa.Column("before_rc", sa.String(), nullable=True),
        sa.Column("during_rc", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("profile_id"),
    )

    op.create_table(
        "stint",
        sa.Column("stint_id", sa.Integer(), nullable=False),
        sa.Column("profile_id", sa.Integer(), nullable=False),
        sa.Column("type_stint", sa.String(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("title", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["profile_id"],
            ["profile.profile_id"],
        ),
        sa.PrimaryKeyConstraint("stint_id"),
    )


def downgrade():

    op.drop_table("stint")
    op.drop_table("profile")
