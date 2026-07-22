"""add details_json column to feedback_reports and create reflections table

Revision ID: g6h7i8j9k0l1
Revises: f1a2b3c4d5e6
Create Date: 2026-07-21 23:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'g6h7i8j9k0l1'
down_revision: Union[str, None] = 'f1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('feedback_reports',
        sa.Column('details_json', postgresql.JSON(), nullable=True)
    )

    op.create_table('reflections',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('session_id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('most_difficult_part', sa.Text(), nullable=True),
        sa.Column('what_to_improve', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['practice_sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('session_id'),
    )
    op.create_index('ix_reflections_session_id', 'reflections', ['session_id'])
    op.create_index('ix_reflections_user_id', 'reflections', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_reflections_user_id', table_name='reflections')
    op.drop_index('ix_reflections_session_id', table_name='reflections')
    op.drop_table('reflections')
    op.drop_column('feedback_reports', 'details_json')
