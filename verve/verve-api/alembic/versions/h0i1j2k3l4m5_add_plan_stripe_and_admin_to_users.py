"""Add plan, stripe_customer_id, is_admin to users

Revision ID: h0i1j2k3l4m5
Revises: g6h7i8j9k0l1
Create Date: 2026-07-22 22:45:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "h0i1j2k3l4m5"
down_revision: Union[str, None] = "g6h7i8j9k0l1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("plan", sa.String(16), nullable=False, server_default="free"))
    op.add_column("users", sa.Column("stripe_customer_id", sa.String(), nullable=True))
    op.add_column("users", sa.Column("is_admin", sa.Boolean(), nullable=False, server_default="false"))


def downgrade() -> None:
    op.drop_column("users", "is_admin")
    op.drop_column("users", "stripe_customer_id")
    op.drop_column("users", "plan")
