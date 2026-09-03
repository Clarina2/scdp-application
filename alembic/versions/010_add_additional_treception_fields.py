"""Add additional fields to TRECEPTION

Revision ID: 010_add_additional_treception
Revises: 009_add_missing_tsortie
Create Date: 2026-09-01 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '010_add_additional_treception'
down_revision = '009_add_missing_tsortie'
branch_labels = None
depends_on = None


def upgrade():
    # Add additional columns to scdp.treception
    op.add_column('treception', sa.Column('date_depart', sa.DateTime(), nullable=True), schema='scdp')
    op.add_column('treception', sa.Column('temp_ech_arr', sa.Float(), nullable=True), schema='scdp')
    op.add_column('treception', sa.Column('dse_ech', sa.Float(), nullable=True), schema='scdp')
    op.add_column('treception', sa.Column('coul_ar_ta', sa.Integer(), nullable=True), schema='scdp')
    op.add_column('treception', sa.Column('coul_ar_15', sa.Integer(), nullable=True), schema='scdp')


def downgrade():
    # Remove columns from scdp.treception
    op.drop_column('treception', 'coul_ar_15', schema='scdp')
    op.drop_column('treception', 'coul_ar_ta', schema='scdp')
    op.drop_column('treception', 'dse_ech', schema='scdp')
    op.drop_column('treception', 'temp_ech_arr', schema='scdp')
    op.drop_column('treception', 'date_depart', schema='scdp')
