"""Add user_settings table

Revision ID: 005_add_user_settings
Revises: 004_add_distributor_code
Create Date: 2026-08-27 10:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '005_add_user_settings'
down_revision = '004_add_distributor_code'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("CREATE SCHEMA IF NOT EXISTS app")
    
    op.create_table(
        'user_settings',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('low_stock_threshold', sa.Integer(), nullable=True, server_default='500'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        schema='app'
    )
    op.create_index(op.f('ix_user_settings_user_id'), 'user_settings', ['user_id'], unique=True, schema='app')
    
    # Add foreign key constraint if users table exists
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'app' AND table_name = 'users') THEN
                ALTER TABLE app.user_settings 
                ADD CONSTRAINT fk_user_settings_user 
                FOREIGN KEY (user_id) REFERENCES app.users (id);
            END IF;
        END $$;
    """)


def downgrade():
    op.drop_index(op.f('ix_user_settings_user_id'), table_name='user_settings', schema='app')
    op.drop_table('user_settings', schema='app')
