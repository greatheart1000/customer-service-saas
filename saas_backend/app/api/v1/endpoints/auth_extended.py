"""
扩展认证相关 API 端点（手机号短信登录、微信登录）
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.api.v1.endpoints import deps
from app.schemas.user import User, Token
from app.services.sms_service import VerificationCodeService
from app.services.wechat_service import WeChatAuthService, WeChatLoginSession
from app.models.user import User as UserModel

router = APIRouter()


# ============ Pydantic Schemas ============

class PhoneLoginRequest(BaseModel):
    """手机号登录请求"""
    phone: str = Field(..., pattern=r'^1[3-9]\d{9}$', description="手机号")
    code: str = Field(..., min_length=6, max_length=6, description="验证码")


class SendCodeRequest(BaseModel):
    """发送验证码请求"""
    phone: str = Field(..., pattern=r'^1[3-9]\d{9}$', description="手机号")


class WeChatQrCodeResponse(BaseModel):
    """微信二维码响应"""
    qr_url: str
    state: str
    expires_in: int = 300  # 5分钟


class WeChatLoginCallback(BaseModel):
    """微信登录回调"""
    code: str = Field(..., description="微信授权码")
    state: str = Field(..., description="状态参数")


class BindWeChatRequest(BaseModel):
    """绑定微信账号请求"""
    code: str = Field(..., description="微信授权码")


class CheckWeChatStatusResponse(BaseModel):
    """检查微信登录状态响应"""
    status: str  # pending, scanning, confirmed, expired
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None


# ============ 手机号短信登录 ============

@router.post("/sms/send-code")
def send_verification_code(
    request: SendCodeRequest,
    db: Session = Depends(deps.get_db),
):
    """
    发送短信验证码

    发送6位数字验证码到指定手机号，验证码5分钟内有效。
    """
    sms_service = VerificationCodeService(db)

    # 生成并发送验证码
    code, success = sms_service.generate_and_send_code(request.phone)

    if success:
        return {
            "message": "验证码发送成功",
            "expires_in": 300,  # 5分钟
            # 开发环境返回验证码
            "debug_code": code if sms_service.sms_provider.__class__.__name__ == "AliyunSMSService" else None
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="验证码发送失败，请稍后重试"
        )


@router.post("/sms/login", response_model=Token)
def login_with_phone(
    request: PhoneLoginRequest,
    db: Session = Depends(deps.get_db),
):
    """
    手机号验证码登录

    使用手机号和验证码登录。如果用户不存在，会自动创建。
    """
    sms_service = VerificationCodeService(db)

    # 验证验证码
    if not sms_service.verify_code(request.phone, request.code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="验证码错误或已过期"
        )

    # 查找或创建用户
    user = db.query(UserModel).filter(UserModel.phone == request.phone).first()

    if not user:
        # 创建新用户
        from app.services.auth_service import AuthService

        auth_service = AuthService(db)

        # 使用临时密码创建用户
        import uuid
        temp_password = uuid.uuid4().hex

        from app.schemas.user import UserRegister
        user_data = UserRegister(
            email=f"phone_{request.phone}@temp.tmp",  # 临时邮箱
            password=temp_password,
            username=f"用户{request.phone[-4:]}"
        )

        user = auth_service.register_user(user_data)

        # 更新手机号
        user.phone = request.phone
        user.is_verified = True  # 手机号已验证
        db.commit()

        db.refresh(user)

    # 检查用户状态
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户账户已被禁用"
        )

    # 生成 Token
    from app.core.security import create_access_token, create_refresh_token

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=30 * 60,
    )


# ============ 微信登录 ============

@router.get("/wechat/qr-code", response_model=WeChatQrCodeResponse)
def get_wechat_qr_code(
    db: Session = Depends(deps.get_db),
):
    """
    获取微信登录二维码

    返回微信登录二维码URL和状态参数。
    前端应该使用这个URL生成二维码，并轮询检查登录状态。
    """
    wechat_service = WeChatAuthService(db)
    session_manager = WeChatLoginSession(db)

    # 生成 state 参数
    state = wechat_service.generate_state()

    # 创建登录会话
    session_manager.create_session(state)

    # 获取微信登录URL
    qr_url = wechat_service.get_qr_code_url(state)

    return WeChatQrCodeResponse(
        qr_url=qr_url,
        state=state,
        expires_in=300,
    )


@router.get("/wechat/check-status", response_model=CheckWeChatStatusResponse)
def check_wechat_login_status(
    state: str = Query(..., description="状态参数"),
    db: Session = Depends(deps.get_db),
):
    """
    检查微信登录状态

    前端应该定期轮询此接口来检查用户是否已扫码确认登录。
    """
    session_manager = WeChatLoginSession(db)

    session_data = session_manager.get_session_status(state)

    if not session_data:
        return CheckWeChatStatusResponse(
            status="expired",
            access_token=None,
            refresh_token=None,
        )

    return CheckWeChatStatusResponse(
        status=session_data["status"],
        # 如果已确认，返回 token
        access_token=None,  # 实际应该从会话中获取
        refresh_token=None,
    )


@router.post("/wechat/callback")
async def handle_wechat_callback(
    callback: WeChatLoginCallback,
    db: Session = Depends(deps.get_db),
):
    """
    处理微信登录回调

    当用户扫码并确认后，微信会重定向到这个接口。
    """
    wechat_service = WeChatAuthService(db)
    session_manager = WeChatLoginSession(db)

    try:
        # 更新会话状态为"扫描中"
        session_manager.update_session_status(callback.state, "scanning")

        # 处理微信登录
        result = await wechat_service.handle_wechat_login(callback.code)

        # 更新会话状态为"已确认"
        session_manager.update_session_status(
            callback.state,
            "confirmed",
            user_id=result["user"].id
        )

        return {
            "access_token": result["access_token"],
            "refresh_token": result["refresh_token"],
            "token_type": result["token_type"],
            "expires_in": result["expires_in"],
            "user": {
                "id": str(result["user"].id),
                "username": result["user"].username,
                "avatar_url": result["user"].avatar_url,
            }
        }

    except Exception as e:
        session_manager.update_session_status(callback.state, "expired")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"微信登录失败: {str(e)}"
        )


@router.post("/wechat/bind")
def bind_wechat_account(
    request: BindWeChatRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    """
    绑定微信账号到当前用户

    已登录的用户可以通过这个接口绑定微信账号，
    绑定后可以使用微信登录。
    """
    import asyncio

    wechat_service = WeChatAuthService(db)

    try:
        # 获取微信信息
        token_data = asyncio.run(wechat_service.get_access_token(request.code))
        openid = token_data.get("openid")
        unionid = token_data.get("unionid")

        # 绑定微信账号
        success = wechat_service.bind_wechat(
            str(current_user.id),
            openid,
            unionid
        )

        if success:
            return {"message": "微信账号绑定成功"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="绑定失败"
            )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"绑定失败: {str(e)}"
        )
