"""Harden users table: add column length constraints and refresh_token hashing

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-04-23 00:00:00.000000

Notes:
    - id:             VARCHAR(36)  — UUID string
    - email:          VARCHAR(255) — RFC 5321 max
    - password_hash:  VARCHAR(60)  — bcrypt always produces exactly 60 chars
    - refresh_token:  VARCHAR(64)  — SHA-256 hex digest of the raw JWT
                      Any existing plaintext JWT tokens are cleared here so that
                      users must re-login after this migration is applied.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Clear existing plaintext refresh tokens — they are incompatible with the
    # new SHA-256 hashed storage and would cause all refresh attempts to fail.
    op.execute("UPDATE users SET refresh_token = NULL")

    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column(
            "id",
            existing_type=sa.String(),
            type_=sa.String(36),
            nullable=False,
        )
        batch_op.alter_column(
            "email",
            existing_type=sa.String(),
            type_=sa.String(255),
            nullable=False,
        )
        batch_op.alter_column(
            "password_hash",
            existing_type=sa.String(),
            type_=sa.String(60),
            nullable=False,
        )
        batch_op.alter_column(
            "refresh_token",
            existing_type=sa.String(),
            type_=sa.String(64),
            nullable=True,
        )


def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column(
            "id",
            existing_type=sa.String(36),
            type_=sa.String(),
            nullable=False,
        )
        batch_op.alter_column(
            "email",
            existing_type=sa.String(255),
            type_=sa.String(),
            nullable=False,
        )
        batch_op.alter_column(
            "password_hash",
            existing_type=sa.String(60),
            type_=sa.String(),
            nullable=False,
        )
        batch_op.alter_column(
            "refresh_token",
            existing_type=sa.String(64),
            type_=sa.String(),
            nullable=True,
        )
