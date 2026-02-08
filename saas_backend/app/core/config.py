"""
应用配置
"""
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用设置"""

    # 应用基本信息
    APP_NAME: str = "智能客服 SaaS 平台"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # 数据库配置
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/saas_customer_service"

    # Redis 配置
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT 配置
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Coze API 配置
    COZE_API_TOKEN: Optional[str] = None
    COZE_API_BASE: str = "https://api.coze.cn"
    COZE_WORKSPACE_ID: Optional[str] = None
    COZE_BOT_ID: Optional[str] = None

    # 微信支付配置
    WECHAT_PAY_APP_ID: Optional[str] = None
    WECHAT_PAY_MCH_ID: Optional[str] = None
    WECHAT_PAY_API_KEY: Optional[str] = None
    WECHAT_PAY_CERT_PATH: Optional[str] = None
    WECHAT_PAY_NOTIFY_URL: Optional[str] = None

    # 支付宝配置
    ALIPAY_APP_ID: Optional[str] = None
    ALIPAY_PRIVATE_KEY: Optional[str] = None
    ALIPAY_PUBLIC_KEY: Optional[str] = None
    ALIPAY_NOTIFY_URL: Optional[str] = None

    # 微信开放平台配置（用于扫码登录）
    WECHAT_APP_ID: Optional[str] = None
    WECHAT_APP_SECRET: Optional[str] = None
    WECHAT_REDIRECT_URI: Optional[str] = None  # 微信登录回调地址

    # 短信服务配置（阿里云或腾讯云）
    SMS_PROVIDER: Optional[str] = "aliyun"  # 短信服务商：aliyun 或 tencent
    ALIYUN_ACCESS_KEY_ID: Optional[str] = None
    ALIYUN_ACCESS_KEY_SECRET: Optional[str] = None
    SMS_SIGN_NAME: Optional[str] = "智能客服平台"  # 短信签名
    SMS_TEMPLATE_CODE: Optional[str] = "SMS_123456789"  # 短信模板代码

    # 邮件配置（用于发送验证邮件）
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: Optional[str] = None

    # 文件上传配置
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"

    # 速率限制配置
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000

    # CORS 配置
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
