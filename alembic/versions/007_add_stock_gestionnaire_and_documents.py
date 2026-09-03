"""Add STOCK_GESTIONNAIRE role and stock_documents table

Revision ID: 007_add_stock_documents
Revises: 006_fix_user_id
Create Date: 2026-08-31

"""
from alembic import op
import sqlalchemy as sa

revision = '007_add_stock_documents'
down_revision = '006_fix_user_id'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TYPE \"Role\" ADD VALUE IF NOT EXISTS 'STOCK_GESTIONNAIRE';")
    op.execute("""
        CREATE TABLE IF NOT EXISTS public.stock_documents (
            id VARCHAR PRIMARY KEY,
            depot_code VARCHAR NOT NULL,
            distributor_code VARCHAR NOT NULL,
            uploaded_by VARCHAR NOT NULL REFERENCES public.users(id),
            file_name VARCHAR NOT NULL,
            storage_path VARCHAR NOT NULL,
            mime_type VARCHAR NOT NULL DEFAULT 'application/pdf',
            file_size INTEGER NOT NULL,
            document_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS ix_stock_documents_depot_code ON public.stock_documents(depot_code);
        CREATE INDEX IF NOT EXISTS ix_stock_documents_distributor_code ON public.stock_documents(distributor_code);
        CREATE INDEX IF NOT EXISTS ix_stock_documents_uploaded_by ON public.stock_documents(uploaded_by);
    """)


def downgrade():
    op.execute("DROP TABLE IF EXISTS public.stock_documents CASCADE;")
