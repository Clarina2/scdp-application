"""Add additional fields to TRECEPTION and TSORTIE

Revision ID: 008
Revises: 007
Create Date: 2026-09-01 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '008_add_additional_fields'
down_revision = '007_add_stock_documents'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to scdp.treception
    op.add_column('treception', sa.Column('code_type_bor', sa.String(length=5), nullable=True), schema='scdp')
    op.add_column('treception', sa.Column('code_mode_trans', sa.String(length=5), nullable=True), schema='scdp')
    op.add_column('treception', sa.Column('qte_rec_15', sa.Float(), nullable=True), schema='scdp')
    op.add_column('treception', sa.Column('num_matricule', sa.String(length=30), nullable=True), schema='scdp')
    op.add_column('treception', sa.Column('num_be', sa.String(length=30), nullable=True), schema='scdp')
    op.add_column('treception', sa.Column('heure_chargement', sa.DateTime(), nullable=True), schema='scdp')

    # Add new columns to scdp.tsortie
    op.add_column('tsortie', sa.Column('code_type_bor', sa.String(length=5), nullable=True), schema='scdp')
    op.add_column('tsortie', sa.Column('code_mode_trans', sa.String(length=5), nullable=True), schema='scdp')
    op.add_column('tsortie', sa.Column('qte_ch_15', sa.Float(), nullable=True), schema='scdp')
    op.add_column('tsortie', sa.Column('num_matricule', sa.String(length=30), nullable=True), schema='scdp')
    op.add_column('tsortie', sa.Column('num_be', sa.String(length=30), nullable=True), schema='scdp')
    op.add_column('tsortie', sa.Column('date_be', sa.DateTime(), nullable=True), schema='scdp')
    op.add_column('tsortie', sa.Column('dse_ech_ta', sa.Float(), nullable=True), schema='scdp')
    op.add_column('tsortie', sa.Column('dse_ech_15', sa.Float(), nullable=True), schema='scdp')
    op.add_column('tsortie', sa.Column('heure_chargement', sa.DateTime(), nullable=True), schema='scdp')
    op.add_column('tsortie', sa.Column('code_orig', sa.String(length=10), nullable=True), schema='scdp')


def downgrade():
    # Remove columns from scdp.treception
    op.drop_column('treception', 'heure_chargement', schema='scdp')
    op.drop_column('treception', 'num_be', schema='scdp')
    op.drop_column('treception', 'num_matricule', schema='scdp')
    op.drop_column('treception', 'qte_rec_15', schema='scdp')
    op.drop_column('treception', 'code_mode_trans', schema='scdp')
    op.drop_column('treception', 'code_type_bor', schema='scdp')

    # Remove columns from scdp.tsortie
    op.drop_column('tsortie', 'code_orig', schema='scdp')
    op.drop_column('tsortie', 'heure_chargement', schema='scdp')
    op.drop_column('tsortie', 'dse_ech_15', schema='scdp')
    op.drop_column('tsortie', 'dse_ech_ta', schema='scdp')
    op.drop_column('tsortie', 'date_be', schema='scdp')
    op.drop_column('tsortie', 'num_be', schema='scdp')
    op.drop_column('tsortie', 'num_matricule', schema='scdp')
    op.drop_column('tsortie', 'qte_ch_15', schema='scdp')
    op.drop_column('tsortie', 'code_mode_trans', schema='scdp')
    op.drop_column('tsortie', 'code_type_bor', schema='scdp')
