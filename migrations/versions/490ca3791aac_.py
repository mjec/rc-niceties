"""Initial database setup

Revision ID: 490ca3791aac
Revises:
Create Date: 2021-03-17 13:38:33.981641

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = '490ca3791aac'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('cache',
                    sa.Column('key', sa.String(length=100), nullable=False),
                    sa.Column('value', sa.PickleType(), nullable=True),
                    sa.Column('last_updated', sa.DateTime(), nullable=True),
                    sa.PrimaryKeyConstraint('key')
                    )
    op.create_table('site_configuration',
                    sa.Column('key', sa.String(length=100), nullable=False),
                    sa.Column('value', sa.PickleType(), nullable=True),
                    sa.PrimaryKeyConstraint('key')
                    )
    op.create_table('user',
                    sa.Column('id', sa.Integer(), autoincrement=False, nullable=False),
                    sa.Column('name', sa.String(length=500), nullable=True),
                    sa.Column('avatar_url', sa.String(length=500), nullable=True),
                    sa.Column('faculty', sa.Boolean(), nullable=True),
                    sa.Column('anonymous_by_default', sa.Boolean(), nullable=True),
                    sa.Column('autosave_timeout', sa.Integer(), nullable=True),
                    sa.Column('autosave_enabled', sa.Boolean(), nullable=True),
                    sa.Column('random_seed', sa.LargeBinary(length=32), nullable=True),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_table('nicety',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('end_date', sa.Date(), nullable=True),
                    sa.Column('author_id', sa.Integer(), nullable=True),
                    sa.Column('target_id', sa.Integer(), nullable=True),
                    sa.Column('anonymous', sa.Boolean(), nullable=True),
                    sa.Column('faculty_reviewed', sa.Boolean(), nullable=True),
                    sa.Column('starred', sa.Boolean(), nullable=True),
                    sa.Column('text', sa.Text(), nullable=True),
                    sa.Column('no_read', sa.Boolean(), nullable=True),
                    sa.Column('date_updated', sa.Text(), nullable=True),
                    sa.ForeignKeyConstraint(['author_id'], ['user.id'], ),
                    sa.PrimaryKeyConstraint('id')
                    )
    # ### end Alembic commands ###


def downgrade():
    # Alembic autogenerated commands omitted;
    # we don't want to downgrade
    pass
