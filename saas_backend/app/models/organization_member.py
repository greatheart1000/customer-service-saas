"""
组织成员模型
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base_class import Base
import enum


class MemberRole(str, enum.Enum):
    """成员角色"""
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"


class OrganizationMember(Base):
    """组织成员表"""
    __tablename__ = "organization_members"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    role = Column(SQLEnum(MemberRole), default=MemberRole.MEMBER)

    joined_at = Column(DateTime, default=datetime.utcnow)

    # 唯一约束：一个用户在一个组织中只能有一个记录
    __table_args__ = (
        UniqueConstraint('organization_id', 'user_id', name='unique_org_user'),
    )

    # 关系
    organization = relationship("Organization", back_populates="members")
    user = relationship("User", back_populates="organization_memberships")

    def __repr__(self):
        return f"<OrganizationMember {self.organization_id}:{self.user_id}:{self.role}>"
