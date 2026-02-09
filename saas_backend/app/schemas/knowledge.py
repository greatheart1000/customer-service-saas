"""
知识库相关的 Pydantic Schemas
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class KnowledgeBase(BaseModel):
    """知识库基础 Schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)


class KnowledgeCreate(KnowledgeBase):
    """创建知识库 Schema"""
    pass


class KnowledgeUpdate(BaseModel):
    """更新知识库 Schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)


class KnowledgeInDB(KnowledgeBase):
    """数据库中的知识库 Schema"""
    id: str
    organization_id: str
    document_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Knowledge(KnowledgeInDB):
    """返回给客户端的知识库 Schema"""
    pass


class KnowledgeListResponse(BaseModel):
    """知识库列表响应"""
    items: list[Knowledge]
    total: int
    page: int
    page_size: int
    has_more: bool


class DocumentBase(BaseModel):
    """文档基础 Schema"""
    title: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=1)


class DocumentCreate(DocumentBase):
    """创建文档 Schema"""
    knowledge_base_id: str = Field(..., min_length=1)


class DocumentUpdate(BaseModel):
    """更新文档 Schema"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    content: Optional[str] = Field(None, min_length=1)


class DocumentInDB(DocumentBase):
    """数据库中的文档 Schema"""
    id: str
    knowledge_base_id: str
    organization_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Document(DocumentInDB):
    """返回给客户端的文档 Schema"""
    pass


class DocumentListResponse(BaseModel):
    """文档列表响应"""
    items: list[Document]
    total: int
    page: int
    page_size: int
    has_more: bool
