# pylint: disable=invalid-name
"""add user roles

Revision ID: 001_add_user_roles
Revises:
Create Date: 2024-02-09

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_add_user_roles'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """添加用户角色字段"""
    # 添加 is_admin 字段（平台管理员）
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'))

    # 添加 is_org_admin 字段（组织管理员）
    op.add_column('users', sa.Column('is_org_admin', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    """回滚：删除用户角色字段"""
    op.drop_column('users', 'is_org_admin')
    op.drop_column('users', 'is_admin')
