"""Adding UniqueConstraint to table nicety, deleting duplicate rows

Revision ID: e88e0781857f
Revises: 490ca3791aac
Create Date: 2021-05-10 16:20:13.973239

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column


# revision identifiers, used by Alembic.
revision = "e88e0781857f"
down_revision = "490ca3791aac"
branch_labels = None
depends_on = None


def upgrade():
    nicety = table("nicety", column("id", sa.Integer))
    connection = op.get_bind()
    result = connection.execute(
        """select A.id, B.id from nicety as A
    join nicety as B
    on A.author_id = B.author_id
    and A.target_id = B.target_id
    and A.text = B.text
    and A.id > B.id;"""
    )
    for row in result:
        print("Deleting duplicate nicety with ID {}".format(row[0]))
        # One option for deletion
        op.execute(sa.delete(nicety).where(nicety.c.id == row[0]))

    op.create_unique_constraint("nicety_author_id_target_id_end_date_key", 'nicety', ['author_id', 'target_id', 'end_date'])

def downgrade():

    op.drop_constraint("nicety_author_id_target_id_end_date_key", "nicety", type_="unique")