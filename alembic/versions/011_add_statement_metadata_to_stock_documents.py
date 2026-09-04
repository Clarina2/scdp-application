"""Add statement metadata to stock documents

Revision ID: 011_add_stock_statement_metadata
Revises: 010_add_additional_treception
Create Date: 2026-09-03 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '011_add_stock_statement_metadata'
down_revision = '010_add_additional_treception'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('stock_documents', sa.Column('statement_type', sa.String(length=20), nullable=True), schema='public')
    op.add_column('stock_documents', sa.Column('statement_start_date', sa.Date(), nullable=True), schema='public')
    op.add_column('stock_documents', sa.Column('statement_end_date', sa.Date(), nullable=True), schema='public')
    op.create_index('ix_stock_documents_statement_type', 'stock_documents', ['statement_type'], unique=False, schema='public')
    op.create_index('ix_stock_documents_statement_start_date', 'stock_documents', ['statement_start_date'], unique=False, schema='public')
    op.create_index('ix_stock_documents_statement_end_date', 'stock_documents', ['statement_end_date'], unique=False, schema='public')
    op.create_index('ix_stock_documents_created_at', 'stock_documents', ['created_at'], unique=False, schema='public')
    op.create_check_constraint(
        'ck_stock_documents_statement_type',
        'stock_documents',
        "statement_type IS NULL OR statement_type IN ('JOURNALIER', 'MENSUEL')",
        schema='public',
    )
    op.create_check_constraint(
        'ck_stock_documents_statement_period',
        'stock_documents',
        'statement_start_date IS NULL OR statement_end_date IS NULL OR statement_start_date <= statement_end_date',
        schema='public',
    )


def downgrade():
    op.drop_constraint('ck_stock_documents_statement_period', 'stock_documents', schema='public', type_='check')
    op.drop_constraint('ck_stock_documents_statement_type', 'stock_documents', schema='public', type_='check')
    op.drop_index('ix_stock_documents_created_at', table_name='stock_documents', schema='public')
    op.drop_index('ix_stock_documents_statement_end_date', table_name='stock_documents', schema='public')
    op.drop_index('ix_stock_documents_statement_start_date', table_name='stock_documents', schema='public')
    op.drop_index('ix_stock_documents_statement_type', table_name='stock_documents', schema='public')
    op.drop_column('stock_documents', 'statement_end_date', schema='public')
    op.drop_column('stock_documents', 'statement_start_date', schema='public')
    op.drop_column('stock_documents', 'statement_type', schema='public')
