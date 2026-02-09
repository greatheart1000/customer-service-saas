"""
知识库管理 Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class KnowledgeBaseBase(BaseModel):
    """知识库基础模型"""
    name: str = Field(..., max_length=200, description="知识库名称")
    description: Optional[str] = Field(None, description="知识库描述")


class KnowledgeBaseCreate(KnowledgeBaseBase):
    """创建知识库"""
    pass


class KnowledgeBaseUpdate(KnowledgeBaseBase):
    """更新知识库"""
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None


class KnowledgeBase(KnowledgeBaseBase):
    """知识库响应模型"""
    id: str
    organization_id: str
    document_count: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentBase(BaseModel):
    """文档基础模型"""
    title: str = Field(..., max_length=500, description="文档标题")
    content: Optional[str] = Field(None, description="文档内容")
    file_url: Optional[str] = Field(None, description="文件URL")
    file_type: Optional[str] = Field(None, max_length=50, description="文件类型")
    file_size: Optional[int] = Field(None, description="文件大小(字节)")


class DocumentCreate(DocumentBase):
    """创建文档"""
    knowledge_base_id: str


class DocumentUpdate(DocumentBase):
    """更新文档"""
    title: Optional[str] = Field(None, max_length=500)
    knowledge_base_id: Optional[str] = None


class Document(DocumentBase):
    """文档响应模型"""
    id: str
    knowledge_base_id: str
    uploaded_by: str
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class KnowledgeBaseListResponse(BaseModel):
    """知识库列表响应"""
    items: List[KnowledgeBase]
    total: int
    page: int
    page_size: int
    has_more: bool


class DocumentListResponse(BaseModel):
    """文档列表响应"""
    items: List[Document]
    total: int
    page: int
    page_size: int
    has_more: bool
