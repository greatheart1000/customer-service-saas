"""
短信服务 - 支持阿里云SMS和腾讯云SMS
"""
import random
import hashlib
import time
from typing import Optional
from datetime import datetime, timedelta

from app.core.config import settings


class SMSService:
    """短信服务基类"""

    def __init__(self):
        self.access_key_id = settings.ALIYUN_ACCESS_KEY_ID
        self.access_key_secret = settings.ALIYUN_ACCESS_KEY_SECRET
        self.sign_name = settings.SMS_SIGN_NAME
        self.template_code = settings.SMS_TEMPLATE_CODE

    def generate_code(self, length: int = 6) -> str:
        """生成验证码"""
        return ''.join([str(random.randint(0, 9)) for _ in range(length)])

    def send_verification_code(self, phone: str, code: str) -> bool:
        """
        发送验证码
        子类需要实现具体逻辑
        """
        raise NotImplementedError("子类必须实现 send_verification_code 方法")


class AliyunSMSService(SMSService):
    """阿里云短信服务"""

    def send_verification_code(self, phone: str, code: str) -> bool:
        """
        发送阿里云短信验证码

        需要安装: pip install alibabacloud_dysmsapi20170525
        """
        try:
            from alibabacloud_dysmsapi20170525.client import Client as DysmsClient
            from alibabacloud_tea_openapi import models as open_api_models
            from alibabacloud_dysmsapi20170525 import models as dysms_models
            from alibabacloud_tea_util import models as util_models

            # 创建客户端
            config = open_api_models.Config(
                access_key_id=self.access_key_id,
                access_key_secret=self.access_key_secret
            )
            config.endpoint = f'dysmsapi.aliyuncs.com'
            client = DysmsClient(config)

            # 发送短信请求
            send_sms_request = dysms_models.SendSmsRequest(
                sign_name=self.sign_name,
                template_code=self.template_code,
                phone_numbers=phone,
                template_param=f'{{"code":"{code}"}}'
            )

            resp = client.send_sms(send_sms_request)

            if resp.body.code == 'OK':
                return True
            else:
                print(f"发送短信失败: {resp.body.message}")
                return False

        except Exception as e:
            print(f"发送短信异常: {e}")
            # 开发环境返回True（模拟发送成功）
            if settings.DEBUG:
                print(f"[模拟短信] 发送验证码到 {phone}: {code}")
                return True
            return False


class TencentSMSService(SMSService):
    """腾讯云短信服务"""

    def send_verification_code(self, phone: str, code: str) -> bool:
        """
        发送腾讯云短信验证码

        需要安装: pip install tencentcloud-sdk-python
        """
        try:
            from tencentcloud.common import credential
            from tencentcloud.common.profile.client_profile import ClientProfile
            from tencentcloud.common.profile.http_profile import HttpProfile
            from tencentcloud.sms.v20210111 import sms_client, models

            # 创建认证对象
            cred = credential.Credential(
                self.access_key_id,
                self.access_key_secret
            )

            # 创建客户端
            httpProfile = HttpProfile()
            httpProfile.endpoint = "sms.tencentcloudapi.com"
            clientProfile = ClientProfile()
            clientProfile.httpProfile = httpProfile

            client = sms_client.SmsClient(cred, "ap-guangzhou", clientProfile)

            # 发送短信请求
            req = models.SendSmsRequest()
            req.PhoneNumberSet = [phone]
            req.TemplateID = int(self.template_code)
            req.TemplateParamSet = [code]
            req.SignName = self.sign_name

            resp = client.SendSms(req)

            if resp.Status == 'OK':
                return True
            else:
                print(f"发送短信失败: {resp.Message}")
                return False

        except Exception as e:
            print(f"发送短信异常: {e}")
            # 开发环境返回True（模拟发送成功）
            if settings.DEBUG:
                print(f"[模拟短信] 发送验证码到 {phone}: {code}")
                return True
            return False


class VerificationCodeService:
    """验证码服务"""

    def __init__(self, db_session):
        self.db = db_session
        # 使用阿里云或腾讯云
        self.sms_provider = AliyunSMSService() if settings.ALIYUN_ACCESS_KEY_ID else TencentSMSService()
        self.code_expire_seconds = 300  # 验证码5分钟过期

    def generate_and_send_code(self, phone: str) -> tuple[str, bool]:
        """
        生成并发送验证码
        返回: (验证码, 是否发送成功)
        """
        # 生成验证码
        code = self.sms_provider.generate_code(6)

        # 发送验证码
        success = self.sms_provider.send_verification_code(phone, code)

        if success:
            # 存储验证码（在实际项目中应该使用 Redis）
            from app.models.verification_code import VerificationCode

            # 删除该手机的旧验证码
            self.db.query(VerificationCode).filter(
                VerificationCode.phone == phone
            ).delete()

            # 创建新验证码记录
            verify_code = VerificationCode(
                phone=phone,
                code=code,
                expires_at=datetime.utcnow() + timedelta(seconds=self.code_expire_seconds)
            )
            self.db.add(verify_code)
            self.db.commit()

        return code, success

    def verify_code(self, phone: str, code: str) -> bool:
        """验证验证码是否正确"""
        from app.models.verification_code import VerificationCode

        verify_record = self.db.query(VerificationCode).filter(
            VerificationCode.phone == phone,
            VerificationCode.code == code,
            VerificationCode.is_used == False,
        ).first()

        if not verify_record:
            return False

        # 检查是否过期
        if verify_record.expires_at < datetime.utcnow():
            return False

        # 标记为已使用
        verify_record.is_used = True
        verify_record.used_at = datetime.utcnow()
        self.db.commit()

        return True
