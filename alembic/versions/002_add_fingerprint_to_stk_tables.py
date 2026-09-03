"""add fingerprint to stsecurite and stkoutil

Revision ID: 002_add_fingerprint_stk
Revises: 001_stage1_sync
Create Date: 2026-08-24

"""
from alembic import op
import sqlalchemy as sa

revision = '002_add_fingerprint_stk'
down_revision = '001_stage1_sync'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('tstsecurite', sa.Column('fingerprint', sa.String(length=64), nullable=True), schema='scdp')
    op.create_index('idx_tstsecurite_fingerprint', 'tstsecurite', ['fingerprint'], unique=True, schema='scdp')

    op.add_column('tstkoutil', sa.Column('fingerprint', sa.String(length=64), nullable=True), schema='scdp')
    op.create_index('idx_tstkoutil_fingerprint', 'tstkoutil', ['fingerprint'], unique=True, schema='scdp')


def downgrade() -> None:
    op.drop_index('idx_tstkoutil_fingerprint', table_name='tstkoutil', schema='scdp')
    op.drop_column('tstkoutil', 'fingerprint', schema='scdp')
    op.drop_index('idx_tstsecurite_fingerprint', table_name='tstsecurite', schema='scdp')
    op.drop_column('tstsecurite', 'fingerprint', schema='scdp')
