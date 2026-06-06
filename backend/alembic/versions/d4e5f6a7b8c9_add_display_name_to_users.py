"""Add display_name to users table

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-04-23 00:00:00.000000

Notes:
    display_name VARCHAR(100) NULL — free-text label shown in the UI
    (e.g. "Good morning, Krisztián!"). No uniqueness constraint.
    Existing rows default to NULL; users can set it during onboarding
    or via PATCH /api/v1/auth/me.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column('display_name', sa.String(100), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('users', 'display_name')
