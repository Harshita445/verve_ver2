"""add prep_seconds and speak_seconds to practice_sessions

Revision ID: e7f8g9h0i1j2
Revises: d3c4e5f6a7b8
Create Date: 2026-07-21 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e7f8g9h0i1j2'
down_revision: Union[str, None] = 'd3c4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('practice_sessions',
        sa.Column('prep_seconds', sa.Integer(), nullable=False, server_default=sa.text('30'))
    )
    op.add_column('practice_sessions',
        sa.Column('speak_seconds', sa.Integer(), nullable=False, server_default=sa.text('120'))
    )


def downgrade() -> None:
    op.drop_column('practice_sessions', 'speak_seconds')
    op.drop_column('practice_sessions', 'prep_seconds')
