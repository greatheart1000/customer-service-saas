"""
微信登录服务
"""
import uuid
import hashlib
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from urllib.parse import quote

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings


class WeChatAuthService:
    """微信认证服务"""

    def __init__(self, db: Session):
        self.db = db
        self.app_id = settings.WECHAT_APP_ID
        self.app_secret = settings.WECHAT_APP_SECRET
        self.redirect_uri = settings.WECHAT_REDIRECT_URI

    def generate_state(self) -> str:
        """生成随机 state 参数，防止 CSRF 攻击"""
        return uuid.uuid4().hex

    def get_qr_code_url(self, state: str) -> str:
        """
        获取微信扫码登录 URL

        微信开放平台文档: https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1419316505&token=&lang=zh_CN
        """
        # 微信开放平台 OAuth2.0 授权 URL
        url = (
            f"https://open.weixin.qq.com/connect/qrconnect"
            f"?appid={self.app_id}"
            f"&redirect_uri={quote(self.redirect_uri)}"
            f"&response_type=code"
            f"&scope=snsapi_login"
            f"&state={state}#wechat_redirect"
        )
        return url

    def get_auth_url(self, state: str) -> str:
        """
        获取微信授权 URL（用于网站应用）

        公众号/小程序文档: https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html
        """
        url = (
            f"https://open.weixin.qq.com/connect/qrconnect"
            f"?appid={self.app_id}"
            f"&redirect_uri={quote(self.redirect_uri)}"
            f"&response_type=code"
            f"&scope=snsapi_login"
            f"&state={state}#wechat_redirect"
        )
        return url

    async def get_access_token(self, code: str) -> Dict[str, Any]:
        """
        通过 code 获取 access_token

        文档: https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html
        """
        url = "https://api.weixin.qq.com/sns/oauth2/access_token"

        params = {
            "appid": self.app_id,
            "secret": self.app_secret,
            "code": code,
            "grant_type": "authorization_code"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            data = response.json()

            if "errcode" in data:
                raise Exception(f"获取 access_token 失败: {data.get('errmsg')}")

            return data

    async def get_user_info(self, access_token: str, openid: str) -> Dict[str, Any]:
        """
        获取微信用户信息

        文档: https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Authorized_Interface_Calling_UnionID.html
        """
        url = "https://api.weixin.qq.com/sns/userinfo"

        params = {
            "access_token": access_token,
            "openid": openid
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            data = response.json()

            if "errcode" in data:
                raise Exception(f"获取用户信息失败: {data.get('errmsg')}")

            return data

    async def handle_wechat_login(self, code: str) -> Dict[str, Any]:
        """
        处理微信登录回调

        流程:
        1. 通过 code 获取 access_token 和 openid
        2. 通过 access_token 和 openid 获取用户信息
        3. 查找或创建用户
        4. 生成 JWT Token
        """
        # 1. 获取 access_token
        token_data = await self.get_access_token(code)
        access_token = token_data.get("access_token")
        openid = token_data.get("openid")
        unionid = token_data.get("unionid")  # 如果是开放平台，会有 unionid

        # 2. 获取用户信息
        user_info = await self.get_user_info(access_token, openid)

        # 3. 查找或创建用户
        from app.models.user import User
        from app.core.security import create_access_token, create_refresh_token

        # 先通过 openid 查找
        user = self.db.query(User).filter(
            User.wechat_openid == openid
        ).first()

        # 如果找不到，尝试通过 unionid 查找
        if not user and unionid:
            user = self.db.query(User).filter(
                User.wechat_unionid == unionid
            ).first()

        # 如果还找不到，创建新用户
        if not user:
            # 创建用户
            user = User(
                email=f"wechat_{openid[:8]}@wechat.tmp",  # 临时邮箱
                username=user_info.get("nickname", f"微信用户_{openid[:8]}"),
                wechat_openid=openid,
                wechat_unionid=unionid,
                is_active=True,
                is_verified=True,  # 微信用户已验证
            )

            # 创建头像URL
            if user_info.get("headimgurl"):
                user.avatar_url = user_info.get("headimgurl")

            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)

            # 创建默认组织
            from app.models.organization import Organization, PlanType
            from app.models.organization_member import OrganizationMember, MemberRole

            org_name = f"{user.username}的组织"
            organization = Organization(
                name=org_name,
                owner_id=user.id,
                plan_type=PlanType.FREE,
            )
            self.db.add(organization)
            self.db.commit()
            self.db.refresh(organization)

            # 添加用户为组织所有者
            member = OrganizationMember(
                organization_id=organization.id,
                user_id=user.id,
                role=MemberRole.OWNER,
            )
            self.db.add(member)
            self.db.commit()

        # 4. 生成 JWT Token
        jwt_token = create_access_token(str(user.id))
        refresh_token = create_refresh_token(str(user.id))

        return {
            "user": user,
            "access_token": jwt_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 30 * 60,  # 30分钟
        }

    def bind_wechat(self, user_id: str, openid: str, unionid: Optional[str] = None) -> bool:
        """
        绑定微信账号到已有用户
        """
        from app.models.user import User

        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return False

        user.wechat_openid = openid
        if unionid:
            user.wechat_unionid = unionid

        self.db.commit()
        return True


class WeChatLoginSession:
    """微信登录会话管理（用于检查扫码状态）"""

    def __init__(self, db: Session):
        self.db = db

    def create_session(self, state: str) -> bool:
        """创建登录会话"""
        from app.models.wechat_login_session import WeChatLoginSession as WeChatSessionModel

        session = WeChatSessionModel(
            state=state,
            status="pending"
        )

        self.db.add(session)
        self.db.commit()
        return True

    def update_session_status(self, state: str, status: str, user_id: Optional[str] = None) -> bool:
        """更新会话状态"""
        from app.models.wechat_login_session import WeChatLoginSession as WeChatSessionModel

        session = self.db.query(WeChatSessionModel).filter(
            WeChatSessionModel.state == state
        ).first()

        if session:
            session.status = status
            if user_id:
                session.user_id = user_id
            self.db.commit()
            return True

        return False

    def get_session_status(self, state: str) -> Optional[Dict[str, Any]]:
        """获取会话状态"""
        from app.models.wechat_login_session import WeChatLoginSession as WeChatSessionModel

        session = self.db.query(WeChatSessionModel).filter(
            WeChatSessionModel.state == state
        ).first()

        if session:
            return {
                "status": session.status,
                "user_id": str(session.user_id) if session.user_id else None,
            }

        return None
