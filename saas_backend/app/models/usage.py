"""
使用量记录模型
"""
import uuid
from datetime import datetime, date
from typing import Optional

from sqlalchemy import Column, DateTime, Date, String, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class UsageRecord(Base):
    """使用量记录表"""
    __tablename__ = "usage_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    resource_type = Column(String(50), nullable=False)  # message, api_call, storage, etc.
    quantity = Column(Integer, default=1)

    extra_data = Column(JSON, nullable=True)  # 额外的元数据信息

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    date = Column(Date, default=date.today, index=True)

    # 关系
    organization = relationship("Organization", back_populates="usage_records")
    user = relationship("User", back_populates="usage_records")

    def __repr__(self):
        return f"<UsageRecord {self.organization_id}:{self.resource_type}:{self.quantity}>"
