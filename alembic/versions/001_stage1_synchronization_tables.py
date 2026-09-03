"""stage 1 synchronization tables

Revision ID: 001_stage1_sync
Revises: 
Create Date: 2026-08-24

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001_stage1_sync'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Create target schemas
    op.execute("CREATE SCHEMA IF NOT EXISTS app;")
    op.execute("CREATE SCHEMA IF NOT EXISTS scdp;")

    # 2. Create app.synchronization_runs
    op.create_table(
        'synchronization_runs',
        sa.Column('id', sa.BigInteger(), sa.Identity(always=True), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('records_read', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('records_inserted', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('records_updated', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('records_failed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        schema='app'
    )

    # 3. Create app.synchronization_tables
    op.create_table(
        'synchronization_tables',
        sa.Column('id', sa.BigInteger(), sa.Identity(always=True), nullable=False),
        sa.Column('synchronization_run_id', sa.BigInteger(), nullable=False),
        sa.Column('source_table', sa.String(length=128), nullable=False),
        sa.Column('target_table', sa.String(length=128), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('records_read', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('records_inserted', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('records_updated', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('records_failed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['synchronization_run_id'], ['app.synchronization_runs.id'], name='fk_sync_table_run'),
        sa.PrimaryKeyConstraint('id'),
        schema='app'
    )

    # 4. Create scdp.tdepot
    op.create_table(
        'tdepot',
        sa.Column('code_ville', sa.Integer(), nullable=False),
        sa.Column('code_depot', sa.String(length=2), nullable=False),
        sa.Column('depot_nom', sa.String(length=30), nullable=True),
        sa.Column('depot_bp', sa.String(length=50), nullable=True),
        sa.Column('depot_tel', sa.String(length=20), nullable=True),
        sa.PrimaryKeyConstraint('code_depot', name='pk_tdepot'),
        schema='scdp'
    )

    # 5. Create scdp.tproduit
    op.create_table(
        'tproduit',
        sa.Column('code_prod', sa.String(length=2), nullable=False),
        sa.Column('prod_nom', sa.String(length=50), nullable=True),
        sa.Column('prod_priorite', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('code_prod', name='pk_tproduit'),
        schema='scdp'
    )

    # 6. Create scdp.tdistributeur
    op.create_table(
        'tdistributeur',
        sa.Column('code_dis', sa.String(length=2), nullable=False),
        sa.Column('dis_nom', sa.String(length=50), nullable=True),
        sa.Column('dis_priorite', sa.Integer(), nullable=True),
        sa.Column('dis_tspp', sa.SmallInteger(), nullable=True),
        sa.Column('dis_export', sa.SmallInteger(), nullable=True),
        sa.PrimaryKeyConstraint('code_dis', name='pk_tdistributeur'),
        schema='scdp'
    )

    # 7. Create scdp.tstockphys
    op.create_table(
        'tstockphys',
        sa.Column('id_pcfp_stk_phys_jour', sa.Integer(), nullable=False),
        sa.Column('code_depot', sa.String(length=2), nullable=True),
        sa.Column('code_dis', sa.String(length=3), nullable=True),
        sa.Column('code_prod', sa.String(length=2), nullable=True),
        sa.Column('date_trait', sa.DateTime(), nullable=True),
        sa.Column('date_jaugeage', sa.DateTime(), nullable=True),
        sa.Column('date_veille', sa.DateTime(), nullable=True),
        sa.Column('stock_ta', sa.Integer(), nullable=True),
        sa.Column('stock_15', sa.Integer(), nullable=True),
        sa.Column('pg_ta', sa.Integer(), nullable=True),
        sa.Column('pg_15', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id_pcfp_stk_phys_jour', name='pk_tstockphys'),
        schema='scdp'
    )


def downgrade() -> None:
    op.drop_table('tstockphys', schema='scdp')
    op.drop_table('tdistributeur', schema='scdp')
    op.drop_table('tproduit', schema='scdp')
    op.drop_table('tdepot', schema='scdp')
    op.drop_table('synchronization_tables', schema='app')
    op.drop_table('synchronization_runs', schema='app')
