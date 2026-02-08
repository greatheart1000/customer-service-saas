"""
认证相关 API 端点
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.v1.endpoints import deps
from app.schemas.user import User, UserCreate, UserLogin, Token, UserRegister
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=User)
def register(
    user_in: UserRegister,
    db: Session = Depends(deps.get_db),
):
    """
    用户注册
    """
    try:
        auth_service = AuthService(db)
        user = auth_service.register_user(user_in)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(deps.get_db),
):
    """
    用户登录（OAuth2 表单）
    """
    auth_service = AuthService(db)

    try:
        token = auth_service.login(form_data.username, form_data.password)
        return token
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/logout")
def logout(
    current_user: User = Depends(deps.get_current_user),
):
    """
    用户登出
    """
    # 在实际应用中，可以将 Token 加入黑名单
    # 这里简单返回成功
    return {"message": "Successfully logged out"}


@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_token: str,
    db: Session = Depends(deps.get_db),
):
    """
    刷新 Token
    """
    auth_service = AuthService(db)

    try:
        token = auth_service.refresh_token(refresh_token)
        return token
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.get("/me", response_model=User)
def get_current_user(
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取当前用户信息
    """
    return current_user


@router.put("/me", response_model=User)
def update_current_user(
    user_update: dict,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    """
    更新当前用户信息
    """
    for field, value in user_update.items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return current_user
