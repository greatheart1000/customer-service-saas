"""
知识库管理 API 端点
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
import logging
import uuid

from app.api.v1.endpoints import deps
from app.api.v1.endpoints.rbac import require_org_admin
from app.schemas.knowledge_base import (
    KnowledgeBase,
    KnowledgeBaseCreate,
    KnowledgeBaseUpdate,
    KnowledgeBaseListResponse,
    Document,
    DocumentCreate,
    DocumentUpdate,
    DocumentListResponse
)
from app.schemas.user import User
from app.models.knowledge_base import KnowledgeBase as KnowledgeBaseModel, Document as DocumentModel
from app.models.organization import Organization
from app.models.user import User as UserModel

# 配置日志
logger = logging.getLogger(__name__)

router = APIRouter()


def get_current_org(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
) -> Organization:
    """获取当前用户所属组织"""
    from app.models.organization_member import OrganizationMember

    membership = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id
    ).first()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User does not belong to any organization"
        )

    org = db.query(Organization).filter(Organization.id == membership.organization_id).first()
    return org


# ==================== 知识库管理 ====================

@router.get("", response_model=KnowledgeBaseListResponse)
def list_knowledge_bases(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = None,
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(deps.get_db),
):
    """
    获取知识库列表
    """
    org = get_current_org(current_user, db)

    query = db.query(KnowledgeBaseModel).filter(
        KnowledgeBaseModel.organization_id == org.id
    )

    if is_active is not None:
        query = query.filter(KnowledgeBaseModel.is_active == is_active)

    total = query.count()
    knowledge_bases = query.offset((page - 1) * page_size).limit(page_size).all()

    return KnowledgeBaseListResponse(
        items=knowledge_bases,
        total=total,
        page=page,
        page_size=page_size,
        has_more=page * page_size < total
    )


@router.post("", response_model=KnowledgeBase, status_code=status.HTTP_201_CREATED)
def create_knowledge_base(
    kb_in: KnowledgeBaseCreate,
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(deps.get_db),
):
    """
    创建知识库
    """
    org = get_current_org(current_user, db)

    # 检查同名知识库
    existing_kb = db.query(KnowledgeBaseModel).filter(
        KnowledgeBaseModel.organization_id == org.id,
        KnowledgeBaseModel.name == kb_in.name
    ).first()

    if existing_kb:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Knowledge base with this name already exists"
        )

    knowledge_base = KnowledgeBaseModel(
        id=str(uuid.uuid4()),
        organization_id=org.id,
        **kb_in.model_dump()
    )

    db.add(knowledge_base)
    db.commit()
    db.refresh(knowledge_base)

    return knowledge_base


@router.get("/{kb_id}", response_model=KnowledgeBase)
def get_knowledge_base(
    kb_id: str,
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(deps.get_db),
):
    """
    获取知识库详情
    """
    org = get_current_org(current_user, db)

    kb = db.query(KnowledgeBaseModel).filter(
        KnowledgeBaseModel.id == kb_id,
        KnowledgeBaseModel.organization_id == org.id
    ).first()

    if not kb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found"
        )

    return kb


@router.put("/{kb_id}", response_model=KnowledgeBase)
def update_knowledge_base(
    kb_id: str,
    kb_in: KnowledgeBaseUpdate,
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(deps.get_db),
):
    """
    更新知识库
    """
    org = get_current_org(current_user, db)

    kb = db.query(KnowledgeBaseModel).filter(
        KnowledgeBaseModel.id == kb_id,
        KnowledgeBaseModel.organization_id == org.id
    ).first()

    if not kb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found"
        )

    # 更新字段
    update_data = kb_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(kb, field, value)

    db.commit()
    db.refresh(kb)

    return kb


@router.delete("/{kb_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_knowledge_base(
    kb_id: str,
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(deps.get_db),
):
    """
    删除知识库（及其所有文档）
    """
    org = get_current_org(current_user, db)

    kb = db.query(KnowledgeBaseModel).filter(
        KnowledgeBaseModel.id == kb_id,
        KnowledgeBaseModel.organization_id == org.id
    ).first()

    if not kb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found"
        )

    db.delete(kb)
    db.commit()

    return None


# ==================== 文档管理 ====================

@router.get("/{kb_id}/documents", response_model=DocumentListResponse)
def list_documents(
    kb_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(deps.get_db),
):
    """
    获取知识库的文档列表
    """
    org = get_current_org(current_user, db)

    # 验证知识库属于当前组织
    kb = db.query(KnowledgeBaseModel).filter(
        KnowledgeBaseModel.id == kb_id,
        KnowledgeBaseModel.organization_id == org.id
    ).first()

    if not kb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found"
        )

    query = db.query(DocumentModel).filter(DocumentModel.knowledge_base_id == kb_id)

    if status:
        query = query.filter(DocumentModel.status == status)

    total = query.count()
    documents = query.offset((page - 1) * page_size).limit(page_size).all()

    return DocumentListResponse(
        items=documents,
        total=total,
        page=page,
        page_size=page_size,
        has_more=page * page_size < total
    )


@router.post("/{kb_id}/documents", response_model=Document, status_code=status.HTTP_201_CREATED)
def create_document(
    kb_id: str,
    doc_in: DocumentCreate,
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(deps.get_db),
):
    """
    创建文档（手动输入内容）
    """
    org = get_current_org(current_user, db)

    # 验证知识库属于当前组织
    kb = db.query(KnowledgeBaseModel).filter(
        KnowledgeBaseModel.id == kb_id,
        KnowledgeBaseModel.organization_id == org.id
    ).first()

    if not kb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found"
        )

    document = DocumentModel(
        id=str(uuid.uuid4()),
        knowledge_base_id=kb_id,
        uploaded_by=current_user.id,
        **doc_in.model_dump(exclude={"knowledge_base_id"})
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    # 更新知识库文档计数
    kb.document_count += 1
    db.commit()

    return document


@router.post("/{kb_id}/documents/upload", response_model=Document, status_code=status.HTTP_201_CREATED)
async def upload_document(
    kb_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(deps.get_db),
):
    """
    上传文档文件
    """
    org = get_current_org(current_user, db)

    # 验证知识库属于当前组织
    kb = db.query(KnowledgeBaseModel).filter(
        KnowledgeBaseModel.id == kb_id,
        KnowledgeBaseModel.organization_id == org.id
    ).first()

    if not kb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found"
        )

    # TODO: 实现文件存储逻辑
    # 这里简化处理，只记录文件信息
    import os

    # 读取文件内容
    content = await file.read()

    document = DocumentModel(
        id=str(uuid.uuid4()),
        title=file.filename,
        knowledge_base_id=kb_id,
        uploaded_by=current_user.id,
        file_type=os.path.splitext(file.filename)[1][1:],
        file_size=len(content),
        status="processing",  # 标记为处理中
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    # 更新知识库文档计数
    kb.document_count += 1
    db.commit()

    # TODO: 异步处理文件内容提取和向量化
    # 这里简化为直接标记为完成
    document.status = "completed"
    db.commit()

    return document


@router.get("/{kb_id}/documents/{doc_id}", response_model=Document)
def get_document(
    kb_id: str,
    doc_id: str,
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(deps.get_db),
):
    """
    获取文档详情
    """
    org = get_current_org(current_user, db)

    # 验证知识库属于当前组织
    kb = db.query(KnowledgeBaseModel).filter(
        KnowledgeBaseModel.id == kb_id,
        KnowledgeBaseModel.organization_id == org.id
    ).first()

    if not kb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found"
        )

    doc = db.query(DocumentModel).filter(
        DocumentModel.id == doc_id,
        DocumentModel.knowledge_base_id == kb_id
    ).first()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    return doc


@router.delete("/{kb_id}/documents/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    kb_id: str,
    doc_id: str,
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(deps.get_db),
):
    """
    删除文档
    """
    logger.info(f"[知识库管理] 用户 {current_user.email} 尝试删除文档 - KB_ID: {kb_id}, Doc_ID: {doc_id}")

    org = get_current_org(current_user, db)

    # 验证知识库属于当前组织
    kb = db.query(KnowledgeBaseModel).filter(
        KnowledgeBaseModel.id == kb_id,
        KnowledgeBaseModel.organization_id == org.id
    ).first()

    if not kb:
        logger.warning(f"[知识库管理] 删除文档失败：知识库不存在 - KB_ID: {kb_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"知识库不存在 (ID: {kb_id})"
        )

    doc = db.query(DocumentModel).filter(
        DocumentModel.id == doc_id,
        DocumentModel.knowledge_base_id == kb_id
    ).first()

    if not doc:
        logger.warning(f"[知识库管理] 删除文档失败：文档不存在 - Doc_ID: {doc_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"文档不存在 (ID: {doc_id})"
        )

    # 记录删除前的文档信息
    doc_info = {"id": doc.id, "title": doc.title, "status": doc.status}
    logger.info(f"[知识库管理] 准备删除文档: {doc_info}")

    db.delete(doc)
    db.commit()

    # 更新知识库文档计数
    old_count = kb.document_count
    kb.document_count = max(0, kb.document_count - 1)
    db.commit()

    logger.info(f"[知识库管理] 成功删除文档 - Doc_ID: {doc_id}, Title: {doc.title}, "
                f"知识库文档计数: {old_count} -> {kb.document_count}, 操作者: {current_user.email}")

    return None
