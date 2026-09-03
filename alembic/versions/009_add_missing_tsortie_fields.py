"""Add missing fields to TSORTIE

Revision ID: 009_add_missing_tsortie
Revises: 008_add_additional_fields
Create Date: 2026-09-01 14:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '009_add_missing_tsortie'
down_revision = '008_add_additional_fields'
branch_labels = None
depends_on = None


def upgrade():
    # Add missing columns to scdp.tsortie (only those not added in 008)
    op.add_column('tsortie', sa.Column('code_type_bor', sa.String(length=5), nullable=True), schema='scdp')
    op.add_column('tsortie', sa.Column('num_be', sa.String(length=30), nullable=True), schema='scdp')
    op.add_column('tsortie', sa.Column('heure_chargement', sa.DateTime(), nullable=True), schema='scdp')
    # code_orig was already added in migration 008


def downgrade():
    # Remove columns from scdp.tsortie
    op.drop_column('tsortie', 'heure_chargement', schema='scdp')
    op.drop_column('tsortie', 'num_be', schema='scdp')
    op.drop_column('tsortie', 'code_type_bor', schema='scdp')
    # code_orig will be removed by migration 008 downgrade
