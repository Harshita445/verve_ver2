"""rename impromptu to freestyle and add prompt_format, debate_side, hints_enabled

Revision ID: i1j2k3l4m5n6
Revises: h0i1j2k3l4m5
Create Date: 2026-07-23 00:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'i1j2k3l4m5n6'
down_revision: Union[str, None] = 'h0i1j2k3l4m5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE sessionmode RENAME VALUE 'impromptu' TO 'freestyle'")
    op.add_column('practice_sessions', sa.Column('prompt_format', sa.String(32), nullable=True))
    op.add_column('practice_sessions', sa.Column('debate_side', sa.String(8), nullable=True))
    op.add_column('practice_sessions', sa.Column('hints_enabled', sa.Boolean(), server_default=sa.text('false')))


def downgrade() -> None:
    op.execute("ALTER TYPE sessionmode RENAME VALUE 'freestyle' TO 'impromptu'")
    op.drop_column('practice_sessions', 'hints_enabled')
    op.drop_column('practice_sessions', 'debate_side')
    op.drop_column('practice_sessions', 'prompt_format')
