"""add nicety.stint_id column + attributes

Revision ID: ab2afff62bc6
Revises: a401bd72aa51
Create Date: 2022-02-21 13:56:17.502717

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "ab2afff62bc6"
down_revision = "a401bd72aa51"
branch_labels = None
depends_on = None


def upgrade():
    """
    The nicety.stint_id column will remain nullable until all profiles
    are populated with their respective stints in the future migrations.

    Foreign Key: Each nicety will be tied to the target_id's stint_id.
    Target ids are now tied to profiles.

    Unique Constraint: One person may write one nicety (per stint) for
    another person.

    "id" column is renamed to "nicety_id"
    """

    op.alter_column("nicety", "id", new_column_name="nicety_id")
    op.add_column("nicety", sa.Column("stint_id", sa.Integer(), nullable=True))
    op.drop_constraint(
        "nicety_author_id_target_id_end_date_key", "nicety", type_="unique"
    )
    op.create_unique_constraint(
        "nicety_author_id_target_id_stint_id_key",
        "nicety",
        ["author_id", "target_id", "stint_id"],
    )
    # op.drop_constraint("nicety_author_id_fkey", "nicety", type_="foreignkey")
    op.create_foreign_key(
        "nicety_profile_target_fkey", "nicety", "profile", ["target_id"], ["profile_id"]
    )
    op.create_foreign_key(
        "nicety_stint_fkey", "nicety", "stint", ["stint_id"], ["stint_id"]
    )
    # op.create_foreign_key(
    #     "nicety_profile_author_fkey", "nicety", "profile", ["author_id"], ["profile_id"]
    # )
    # op.create_unique_constraint(
    #     "stint_profile_id_start_date_key", "stint", ["profile_id", "start_date"]
    # )


def downgrade():
    # op.drop_constraint("stint_profile_id_start_date_key", "stint", type_="unique")
    op.drop_constraint("nicety_profile_target_fkey", "nicety", type_="foreignkey")
    op.drop_constraint("nicety_stint_fkey", "nicety", type_="foreignkey")
    # op.drop_constraint("nicety_profile_author_fkey", "nicety", type_="foreignkey")
    # op.create_foreign_key(
        # "nicety_author_id_fkey", "nicety", "user", ["author_id"], ["id"]
    # )
    op.drop_constraint(
        "nicety_author_id_target_id_stint_id_key", "nicety", type_="unique"
    )
    op.create_unique_constraint(
        "nicety_author_id_target_id_end_date_key",
        "nicety",
        ["author_id", "target_id", "end_date"],
    )
    op.drop_column("nicety", "stint_id")
    op.alter_column("nicety", "nicety_id", new_column_name="id")
