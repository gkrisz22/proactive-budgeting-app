"""Add all feature tables: categories, budget_rules, transactions, alerts, events

Revision ID: b2c3d4e5f6a7
Revises: 9ef3c7988726
Create Date: 2026-04-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = '9ef3c7988726'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # categories
    op.create_table(
        'categories',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('icon', sa.String(), nullable=True),
        sa.Column('is_savings_goal', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('monthly_target', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_categories_user_id'), 'categories', ['user_id'], unique=False)

    # budget_rules
    op.create_table(
        'budget_rules',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('label', sa.String(), nullable=False),
        sa.Column('percentage', sa.Float(), nullable=False),
        sa.Column('monthly_income', sa.Float(), nullable=True),
        sa.Column('currency', sa.String(), nullable=False, server_default=sa.text("'HUF'")),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_budget_rules_user_id'), 'budget_rules', ['user_id'], unique=False)

    # transactions
    op.create_table(
        'transactions',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(), nullable=False, server_default=sa.text("'HUF'")),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('category_id', sa.String(), nullable=True),
        sa.Column('transaction_date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_transactions_user_id'), 'transactions', ['user_id'], unique=False)
    op.create_index(op.f('ix_transactions_category_id'), 'transactions', ['category_id'], unique=False)

    # alerts
    op.create_table(
        'alerts',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('category_id', sa.String(), nullable=True),
        sa.Column('alert_type', sa.String(), nullable=False),
        sa.Column('message', sa.String(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_alerts_user_id'), 'alerts', ['user_id'], unique=False)

    # events
    op.create_table(
        'events',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('estimated_cost', sa.Float(), nullable=False),
        sa.Column('event_date', sa.Date(), nullable=False),
        sa.Column('category_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_events_user_id'), 'events', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_events_user_id'), table_name='events')
    op.drop_table('events')

    op.drop_index(op.f('ix_alerts_user_id'), table_name='alerts')
    op.drop_table('alerts')

    op.drop_index(op.f('ix_transactions_category_id'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_user_id'), table_name='transactions')
    op.drop_table('transactions')

    op.drop_index(op.f('ix_budget_rules_user_id'), table_name='budget_rules')
    op.drop_table('budget_rules')

    op.drop_index(op.f('ix_categories_user_id'), table_name='categories')
    op.drop_table('categories')
