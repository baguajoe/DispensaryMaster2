"""empty message

Revision ID: 610fbd6060b4
Revises: 8bcbfc008163
Create Date: 2025-01-13 22:58:55.833962

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '610fbd6060b4'
down_revision = '8bcbfc008163'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('report',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('type', sa.String(length=50), nullable=False),
    sa.Column('filters', sa.JSON(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('generated_by', sa.Integer(), nullable=True),
    sa.Column('file_path', sa.String(length=255), nullable=True),
    sa.ForeignKeyConstraint(['generated_by'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('report')
    # ### end Alembic commands ###
