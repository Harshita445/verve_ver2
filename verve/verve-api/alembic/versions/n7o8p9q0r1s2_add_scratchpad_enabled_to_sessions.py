"""add scratchpad_enabled to practice_sessions

Revision ID: n7o8p9q0r1s2
Revises: i1j2k3l4m5n6
Create Date: 2026-07-23 01:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'n7o8p9q0r1s2'
down_revision: Union[str, None] = 'i1j2k3l4m5n6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('practice_sessions', sa.Column('scratchpad_enabled', sa.Boolean(), server_default=sa.text('false')))


def downgrade() -> None:
    op.drop_column('practice_sessions', 'scratchpad_enabled')
