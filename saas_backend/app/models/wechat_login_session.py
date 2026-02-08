"""
微信登录会话模型
"""
import uuid
from datetime import datetime, timedelta

from sqlalchemy import Column, DateTime, String, ForeignKey, Boolean

from app.db.base_class import Base


class WeChatLoginSession(Base):
    """微信登录会话表"""
    __tablename__ = "wechat_login_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    state = Column(String(100), unique=True, nullable=False, index=True)  # OAuth state 参数

    status = Column(String(20), default="pending")  # pending, scanning, confirmed, expired
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)

    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(minutes=5))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<WeChatLoginSession {self.state}: {self.status}>"
