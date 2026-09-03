"""add all remaining scdp replicated tables

Revision ID: 003_add_remaining_scdp_tables
Revises: 002_add_fingerprint_stk
Create Date: 2026-08-24

"""
from alembic import op
import sqlalchemy as sa

revision = '003_add_remaining_scdp_tables'
down_revision = '002_add_fingerprint_stk'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Create Reference Tables
    op.create_table(
        'tville',
        sa.Column('code_ville', sa.Integer(), nullable=False),
        sa.Column('ville_nom', sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint('code_ville', name='pk_tville'),
        schema='scdp'
    )

    op.create_table(
        'ttyperegul',
        sa.Column('code_type_regul', sa.String(length=5), nullable=False),
        sa.Column('type_regul_nom', sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint('code_type_regul', name='pk_ttyperegul'),
        schema='scdp'
    )

    op.create_table(
        'tdestination',
        sa.Column('code_dest', sa.String(length=10), nullable=False),
        sa.Column('dest_nom', sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint('code_dest', name='pk_tdestination'),
        schema='scdp'
    )

    op.create_table(
        'torigine',
        sa.Column('code_orig', sa.String(length=10), nullable=False),
        sa.Column('orig_nom', sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint('code_orig', name='pk_torigine'),
        schema='scdp'
    )

    op.create_table(
        'tmodetrans',
        sa.Column('code_mode', sa.String(length=5), nullable=False),
        sa.Column('mode_nom', sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint('code_mode', name='pk_tmodetrans'),
        schema='scdp'
    )

    op.create_table(
        'ttypebor',
        sa.Column('code_type_bor', sa.String(length=5), nullable=False),
        sa.Column('type_bor_nom', sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint('code_type_bor', name='pk_ttypebor'),
        schema='scdp'
    )

    op.create_table(
        'twagon',
        sa.Column('code_wagon', sa.String(length=10), nullable=False),
        sa.Column('wagon_nom', sa.String(length=50), nullable=True),
        sa.Column('capa_wagon', sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint('code_wagon', name='pk_twagon'),
        schema='scdp'
    )

    # 2. Create Stock Threshold Tables (if not existing)
    op.execute("""
        CREATE TABLE IF NOT EXISTS scdp.tstsecurite (
            id_stk_sec SERIAL PRIMARY KEY,
            code_depot VARCHAR(2),
            code_prod VARCHAR(2),
            qte_securite DOUBLE PRECISION,
            fingerprint VARCHAR(64)
        );
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS scdp.tstkoutil (
            id_stk_outil SERIAL PRIMARY KEY,
            code_depot VARCHAR(2),
            code_prod VARCHAR(2),
            qte_outil DOUBLE PRECISION,
            fingerprint VARCHAR(64)
        );
    """)

    # 3. Create Business & Transaction Tables
    op.create_table(
        'tregul',
        sa.Column('code_regul', sa.String(length=10), nullable=False),
        sa.Column('regul_nom', sa.String(length=50), nullable=True),
        sa.Column('code_depot', sa.String(length=2), nullable=True),
        sa.Column('code_prod', sa.String(length=2), nullable=True),
        sa.Column('code_dis_cre', sa.String(length=3), nullable=True),
        sa.Column('code_dis_deb', sa.String(length=3), nullable=True),
        sa.Column('code_type_regul', sa.String(length=5), nullable=True),
        sa.PrimaryKeyConstraint('code_regul', name='pk_tregul'),
        schema='scdp'
    )

    op.create_table(
        'tregularisation',
        sa.Column('regularisation_id', sa.Integer(), sa.Identity(always=True), nullable=False),
        sa.Column('code_regul', sa.String(length=10), nullable=True),
        sa.Column('code_depot', sa.String(length=2), nullable=True),
        sa.Column('code_prod', sa.String(length=2), nullable=True),
        sa.Column('date_regul', sa.DateTime(), nullable=True),
        sa.Column('qte_regul', sa.Float(), nullable=True),
        sa.Column('fingerprint', sa.String(length=64), nullable=False),
        sa.PrimaryKeyConstraint('regularisation_id', name='pk_tregularisation'),
        schema='scdp'
    )
    op.create_index('idx_tregularisation_fingerprint', 'tregularisation', ['fingerprint'], unique=True, schema='scdp')

    op.create_table(
        'tperte',
        sa.Column('perte_id', sa.Integer(), sa.Identity(always=True), nullable=False),
        sa.Column('code_depot', sa.String(length=2), nullable=True),
        sa.Column('code_prod', sa.String(length=2), nullable=True),
        sa.Column('date_perte', sa.DateTime(), nullable=True),
        sa.Column('qte_perte', sa.Float(), nullable=True),
        sa.Column('fingerprint', sa.String(length=64), nullable=False),
        sa.PrimaryKeyConstraint('perte_id', name='pk_tperte'),
        schema='scdp'
    )
    op.create_index('idx_tperte_fingerprint', 'tperte', ['fingerprint'], unique=True, schema='scdp')

    op.create_table(
        'treception',
        sa.Column('reception_id', sa.Integer(), sa.Identity(always=True), nullable=False),
        sa.Column('num_rec', sa.String(length=30), nullable=True),
        sa.Column('code_depot', sa.String(length=2), nullable=True),
        sa.Column('code_dis', sa.String(length=3), nullable=True),
        sa.Column('code_prod', sa.String(length=2), nullable=True),
        sa.Column('date_rec', sa.DateTime(), nullable=True),
        sa.Column('qte_rec', sa.Float(), nullable=True),
        sa.Column('fingerprint', sa.String(length=64), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('reception_id', name='pk_treception'),
        schema='scdp'
    )
    op.create_index('idx_treception_fingerprint', 'treception', ['fingerprint'], unique=True, schema='scdp')

    op.create_table(
        'tsortie',
        sa.Column('sortie_id', sa.Integer(), sa.Identity(always=True), nullable=False),
        sa.Column('num_bor', sa.String(length=30), nullable=True),
        sa.Column('code_depot', sa.String(length=2), nullable=True),
        sa.Column('code_dis', sa.String(length=3), nullable=True),
        sa.Column('code_prod', sa.String(length=2), nullable=True),
        sa.Column('date_sortie', sa.DateTime(), nullable=True),
        sa.Column('qte_sortie', sa.Float(), nullable=True),
        sa.Column('fingerprint', sa.String(length=64), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('sortie_id', name='pk_tsortie'),
        schema='scdp'
    )
    op.create_index('idx_tsortie_fingerprint', 'tsortie', ['fingerprint'], unique=True, schema='scdp')

    # 4. Performance Indexes on FK lookup columns
    op.create_index('idx_tstockphys_code_depot', 'tstockphys', ['code_depot'], schema='scdp')
    op.create_index('idx_tstockphys_code_prod', 'tstockphys', ['code_prod'], schema='scdp')
    op.create_index('idx_tstockphys_code_dis', 'tstockphys', ['code_dis'], schema='scdp')
    op.create_index('idx_treception_code_depot', 'treception', ['code_depot'], schema='scdp')
    op.create_index('idx_tsortie_code_depot', 'tsortie', ['code_depot'], schema='scdp')
    op.create_index('idx_tregul_code_depot', 'tregul', ['code_depot'], schema='scdp')


def downgrade() -> None:
    op.drop_index('idx_tregul_code_depot', table_name='tregul', schema='scdp')
    op.drop_index('idx_tsortie_code_depot', table_name='tsortie', schema='scdp')
    op.drop_index('idx_treception_code_depot', table_name='treception', schema='scdp')
    op.drop_index('idx_tstockphys_code_dis', table_name='tstockphys', schema='scdp')
    op.drop_index('idx_tstockphys_code_prod', table_name='tstockphys', schema='scdp')
    op.drop_index('idx_tstockphys_code_depot', table_name='tstockphys', schema='scdp')

    op.drop_index('idx_tsortie_fingerprint', table_name='tsortie', schema='scdp')
    op.drop_table('tsortie', schema='scdp')
    op.drop_index('idx_treception_fingerprint', table_name='treception', schema='scdp')
    op.drop_table('treception', schema='scdp')
    op.drop_index('idx_tperte_fingerprint', table_name='tperte', schema='scdp')
    op.drop_table('tperte', schema='scdp')
    op.drop_index('idx_tregularisation_fingerprint', table_name='tregularisation', schema='scdp')
    op.drop_table('tregularisation', schema='scdp')
    op.drop_table('tregul', schema='scdp')

    op.drop_table('twagon', schema='scdp')
    op.drop_table('ttypebor', schema='scdp')
    op.drop_table('tmodetrans', schema='scdp')
    op.drop_table('torigine', schema='scdp')
    op.drop_table('tdestination', schema='scdp')
    op.drop_table('ttyperegul', schema='scdp')
    op.drop_table('tville', schema='scdp')
