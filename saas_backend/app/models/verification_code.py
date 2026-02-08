"""
验证码模型
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, Boolean

from app.db.base_class import Base


class VerificationCode(Base):
    """验证码表"""
    __tablename__ = "verification_codes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone = Column(String(20), nullable=False, index=True)
    code = Column(String(10), nullable=False)

    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    used_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<VerificationCode {self.phone}>"
