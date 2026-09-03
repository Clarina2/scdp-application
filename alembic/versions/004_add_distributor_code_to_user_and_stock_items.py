"""Add distributor_code to User and StockItem models

Revision ID: 004_add_distributor_code
Revises: 003_add_remaining_scdp_tables
Create Date: 2026-08-27

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004_add_distributor_code'
down_revision = '003_add_remaining_scdp_tables'
branch_labels = None
depends_on = None


def upgrade():
    # Add distributor_code column to users table
    op.add_column('users', sa.Column('distributor_code', sa.String(length=3), nullable=True))
    op.create_index(op.f('ix_users_distributor_code'), 'users', ['distributor_code'], unique=False)
    
    # Add distributor_code column to stock_items table
    op.add_column('stock_items', sa.Column('distributor_code', sa.String(), nullable=True))
    op.create_index(op.f('ix_stock_items_distributor_code'), 'stock_items', ['distributor_code'], unique=False)


def downgrade():
    # Remove distributor_code column from stock_items table
    op.drop_index(op.f('ix_stock_items_distributor_code'), table_name='stock_items')
    op.drop_column('stock_items', 'distributor_code')
    
    # Remove distributor_code column from users table
    op.drop_index(op.f('ix_users_distributor_code'), table_name='users')
    op.drop_column('users', 'distributor_code')
