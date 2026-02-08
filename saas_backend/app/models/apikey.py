"""
API 密钥模型
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class APIKey(Base):
    """API 密钥表"""
    __tablename__ = "api_keys"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    key_hash = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=True)  # 密钥名称（便于识别）
    scopes = Column(JSON, nullable=True)  # 权限范围（存储为 JSON 数组）

    is_active = Column(Boolean, default=True)
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    organization = relationship("Organization", back_populates="api_keys")
    user = relationship("User", back_populates="api_keys")

    def __repr__(self):
        return f"<APIKey {self.name}>"
