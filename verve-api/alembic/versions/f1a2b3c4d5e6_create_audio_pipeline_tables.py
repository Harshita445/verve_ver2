"""create audio pipeline tables and update session status enum

Revision ID: f1a2b3c4d5e6
Revises: e7f8g9h0i1j2
Create Date: 2026-07-21 23:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
# revision identifiers, used by Alembic.
revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, None] = 'e7f8g9h0i1j2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- audio_files ---
    op.create_table('audio_files',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('session_id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('storage_url', sa.String(), nullable=False),
        sa.Column('storage_provider', sa.String(), nullable=False, server_default='cloudinary'),
        sa.Column('file_format', sa.String(), nullable=False, server_default='webm'),
        sa.Column('file_size_bytes', sa.Integer(), nullable=True),
        sa.Column('duration_seconds', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['practice_sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_audio_files_session_id', 'audio_files', ['session_id'])
    op.create_index('ix_audio_files_user_id', 'audio_files', ['user_id'])

    # --- transcripts ---
    op.create_table('transcripts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('session_id', sa.UUID(), nullable=False),
        sa.Column('full_text', sa.Text(), nullable=False),
        sa.Column('language', sa.Text(), nullable=False, server_default='en'),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('word_count', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['practice_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('session_id'),
    )
    op.create_index('ix_transcripts_session_id', 'transcripts', ['session_id'])

    # --- feedback_reports ---
    op.create_table('feedback_reports',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('session_id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('overall_score', sa.Integer(), nullable=False),
        sa.Column('structure_score', sa.Integer(), nullable=False),
        sa.Column('relevance_score', sa.Integer(), nullable=False),
        sa.Column('evidence_score', sa.Integer(), nullable=False),
        sa.Column('persuasion_score', sa.Integer(), nullable=False),
        sa.Column('confidence_score', sa.Integer(), nullable=False),
        sa.Column('examples_score', sa.Integer(), nullable=False),
        sa.Column('strongest_skill', sa.Text(), nullable=False),
        sa.Column('weakest_skill', sa.Text(), nullable=False),
        sa.Column('next_focus', sa.Text(), nullable=False),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('rating_change', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('rating_before', sa.Integer(), nullable=False, server_default='1200'),
        sa.Column('rating_after', sa.Integer(), nullable=False, server_default='1200'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['practice_sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('session_id'),
    )
    op.create_index('ix_feedback_reports_session_id', 'feedback_reports', ['session_id'])
    op.create_index('ix_feedback_reports_user_id', 'feedback_reports', ['user_id'])

    # --- communication_ratings ---
    op.create_table('communication_ratings',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('session_id', sa.UUID(), nullable=True),
        sa.Column('rating_before', sa.Integer(), nullable=False),
        sa.Column('rating_after', sa.Integer(), nullable=False),
        sa.Column('rating_change', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['practice_sessions.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_communication_ratings_user_id', 'communication_ratings', ['user_id'])

    # --- goals ---
    op.create_table('goals',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('target_sessions', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('current_progress', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('achieved', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_goals_user_id', 'goals', ['user_id'])

    # --- achievements ---
    op.create_table('achievements',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('icon', sa.Text(), nullable=False),
        sa.Column('unlocked', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('unlocked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_achievements_user_id', 'achievements', ['user_id'])

    # --- Update sessionstatus enum ---
    # Add new values and replace 'complete' with 'completed'
    op.execute("""
        CREATE TYPE sessionstatus_new AS ENUM (
            'pending', 'uploading', 'recording', 'processing',
            'transcribing', 'analyzing', 'completed', 'failed'
        )
    """)
    op.execute("""
        ALTER TABLE practice_sessions
        ALTER COLUMN status TYPE sessionstatus_new
        USING CASE
            WHEN status::text = 'complete' THEN 'completed'::sessionstatus_new
            ELSE status::text::sessionstatus_new
        END
    """)
    op.execute("DROP TYPE sessionstatus")
    op.execute("ALTER TYPE sessionstatus_new RENAME TO sessionstatus")


def downgrade() -> None:
    # Revert enum to original values
    op.execute("""
        CREATE TYPE sessionstatus_old AS ENUM (
            'pending', 'recording', 'processing', 'complete', 'failed'
        )
    """)
    op.execute("""
        ALTER TABLE practice_sessions
        ALTER COLUMN status TYPE sessionstatus_old
        USING CASE
            WHEN status::text = 'completed' THEN 'complete'::sessionstatus_old
            WHEN status::text IN ('uploading', 'transcribing', 'analyzing') THEN 'pending'::sessionstatus_old
            ELSE status::text::sessionstatus_old
        END
    """)
    op.execute("DROP TYPE sessionstatus")
    op.execute("ALTER TYPE sessionstatus_old RENAME TO sessionstatus")

    op.drop_index('ix_achievements_user_id', table_name='achievements')
    op.drop_table('achievements')
    op.drop_index('ix_goals_user_id', table_name='goals')
    op.drop_table('goals')
    op.drop_index('ix_communication_ratings_user_id', table_name='communication_ratings')
    op.drop_table('communication_ratings')
    op.drop_index('ix_feedback_reports_user_id', table_name='feedback_reports')
    op.drop_index('ix_feedback_reports_session_id', table_name='feedback_reports')
    op.drop_table('feedback_reports')
    op.drop_index('ix_transcripts_session_id', table_name='transcripts')
    op.drop_table('transcripts')
    op.drop_index('ix_audio_files_user_id', table_name='audio_files')
    op.drop_index('ix_audio_files_session_id', table_name='audio_files')
    op.drop_table('audio_files')
