"""
知识库数据模型
"""
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base


class KnowledgeBase(Base):
    """知识库模型"""
    __tablename__ = "knowledge_bases"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    document_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    documents = relationship("Document", back_populates="knowledge_base", cascade="all, delete-orphan")


class Document(Base):
    """文档模型"""
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=True)
    file_url = Column(String(500), nullable=True)
    file_type = Column(String(50), nullable=True)  # pdf, docx, txt, md
    file_size = Column(Integer, nullable=True)
    knowledge_base_id = Column(String(36), ForeignKey("knowledge_bases.id"), nullable=False)
    uploaded_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="pending")  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    knowledge_base = relationship("KnowledgeBase", back_populates="documents")
