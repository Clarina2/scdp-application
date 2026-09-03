"""Fix user_settings user_id type to match User.id (String)

Revision ID: 006_fix_user_id
Revises: 005_add_user_settings
Create Date: 2026-08-27

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '006_fix_user_id'
down_revision = '005_add_user_settings'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("CREATE SCHEMA IF NOT EXISTS app")
    
    # Drop the foreign key constraint if it exists
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_user_settings_user' 
                AND table_schema = 'app' 
                AND table_name = 'user_settings'
            ) THEN
                ALTER TABLE app.user_settings DROP CONSTRAINT fk_user_settings_user;
            END IF;
        END $$;
    """)
    
    # Alter the user_id column type from integer to varchar
    op.alter_column(
        'user_settings',
        'user_id',
        existing_type=sa.Integer(),
        type_=sa.String(),
        schema='app'
    )
    
    # Re-add the foreign key constraint
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
                ALTER TABLE app.user_settings 
                ADD CONSTRAINT fk_user_settings_user 
                FOREIGN KEY (user_id) REFERENCES public.users (id);
            END IF;
        END $$;
    """)


def downgrade():
    # Drop the foreign key constraint
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_user_settings_user' 
                AND table_schema = 'app' 
                AND table_name = 'user_settings'
            ) THEN
                ALTER TABLE app.user_settings DROP CONSTRAINT fk_user_settings_user;
            END IF;
        END $$;
    """)
    
    # Revert the user_id column type back to integer
    op.alter_column(
        'user_settings',
        'user_id',
        existing_type=sa.String(),
        type_=sa.Integer(),
        schema='app'
    )
    
    # Re-add the foreign key constraint
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
                ALTER TABLE app.user_settings 
                ADD CONSTRAINT fk_user_settings_user 
                FOREIGN KEY (user_id) REFERENCES public.users (id);
            END IF;
        END $$;
    """)
