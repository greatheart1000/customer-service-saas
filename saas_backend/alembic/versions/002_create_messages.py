# pylint: disable=invalid-name
"""create messages table

Revision ID: 002_create_messages
Revises: 001_add_user_roles
Create Date: 2024-02-09

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_create_messages'
down_revision = '001_add_user_roles'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """创建消息表"""
    op.create_table(
        'messages',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('conversation_id', sa.String(36), sa.ForeignKey('conversations.id'), nullable=False),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('coze_message_id', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )

    # 创建索引
    op.create_index('ix_messages_conversation_id', 'messages', ['conversation_id'])
    op.create_index('ix_messages_user_id', 'messages', ['user_id'])
    op.create_index('ix_messages_created_at', 'messages', ['created_at'])


def downgrade() -> None:
    """回滚：删除消息表"""
    op.drop_table('messages')
