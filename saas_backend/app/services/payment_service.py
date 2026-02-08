"""
支付服务（微信支付和支付宝）
"""
import uuid
import hashlib
import json
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from decimal import Decimal

from app.models.order import Order, OrderStatus, PaymentMethod
from app.models.subscription import Subscription, SubscriptionStatus, BillingCycle
from app.models.organization import Organization
from app.schemas.payment import PaymentResponse
from app.core.config import settings


class PaymentService:
    """支付服务类"""

    def __init__(self, db: Session):
        self.db = db

    def create_order(
        self,
        organization_id: uuid.UUID,
        user_id: uuid.UUID,
        amount: Decimal,
        payment_method: PaymentMethod,
        plan_type: str,
        billing_cycle: str,
    ) -> Order:
        """
        创建订单
        """
        # 生成订单号
        order_no = self._generate_order_no()

        order = Order(
            organization_id=organization_id,
            user_id=user_id,
            order_no=order_no,
            amount=amount,
            payment_method=payment_method,
            plan_type=plan_type,
            billing_cycle=billing_cycle,
            status=OrderStatus.PENDING,
        )

        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)

        return order

    def create_wechat_payment(
        self,
        organization_id: uuid.UUID,
        user_id: uuid.UUID,
        amount: Decimal,
        plan_type: str,
        billing_cycle: str,
    ) -> PaymentResponse:
        """
        创建微信支付订单
        """
        # 创建订单记录
        order = self.create_order(
            organization_id=organization_id,
            user_id=user_id,
            amount=amount,
            payment_method=PaymentMethod.WECHAT,
            plan_type=plan_type,
            billing_cycle=billing_cycle,
        )

        # 调用微信支付 API 创建订单
        # 这里使用模拟实现，实际需要调用微信支付 SDK
        payment_url, qr_code = self._call_wechat_pay_api(order)

        return PaymentResponse(
            order_id=order.id,
            order_no=order.order_no,
            amount=order.amount,
            currency=order.currency,
            payment_method="wechat",
            payment_url=payment_url,
            qr_code=qr_code,
        )

    def create_alipay_payment(
        self,
        organization_id: uuid.UUID,
        user_id: uuid.UUID,
        amount: Decimal,
        plan_type: str,
        billing_cycle: str,
    ) -> PaymentResponse:
        """
        创建支付宝支付订单
        """
        # 创建订单记录
        order = self.create_order(
            organization_id=organization_id,
            user_id=user_id,
            amount=amount,
            payment_method=PaymentMethod.ALIPAY,
            plan_type=plan_type,
            billing_cycle=billing_cycle,
        )

        # 调用支付宝 API 创建订单
        # 这里使用模拟实现，实际需要调用支付宝 SDK
        payment_url, qr_code = self._call_alipay_api(order)

        return PaymentResponse(
            order_id=order.id,
            order_no=order.order_no,
            amount=order.amount,
            currency=order.currency,
            payment_method="alipay",
            payment_url=payment_url,
            qr_code=qr_code,
        )

    def handle_wechat_callback(self, callback_data: dict) -> bool:
        """
        处理微信支付回调
        """
        # 验证签名
        if not self._verify_wechat_sign(callback_data):
            return False

        # 获取订单信息
        order_no = callback_data.get("out_trade_no")
        transaction_id = callback_data.get("transaction_id")

        order = self.db.query(Order).filter(Order.order_no == order_no).first()
        if not order:
            return False

        # 更新订单状态
        order.status = OrderStatus.PAID
        order.payment_no = transaction_id
        order.paid_at = datetime.utcnow()
        self.db.commit()

        # 激活订阅
        self._activate_subscription(order)

        return True

    def handle_alipay_callback(self, callback_data: dict) -> bool:
        """
        处理支付宝回调
        """
        # 验证签名
        if not self._verify_alipay_sign(callback_data):
            return False

        # 获取订单信息
        order_no = callback_data.get("out_order_no")
        trade_no = callback_data.get("trade_no")

        order = self.db.query(Order).filter(Order.order_no == order_no).first()
        if not order:
            return False

        # 更新订单状态
        order.status = OrderStatus.PAID
        order.payment_no = trade_no
        order.paid_at = datetime.utcnow()
        self.db.commit()

        # 激活订阅
        self._activate_subscription(order)

        return True

    def _generate_order_no(self) -> str:
        """生成订单号"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        random_str = uuid.uuid4().hex[:8].upper()
        return f"ORDER{timestamp}{random_str}"

    def _call_wechat_pay_api(self, order: Order) -> tuple[str, str]:
        """
        调用微信支付 API（模拟实现）
        实际应该使用 wechatpy 或其他微信支付 SDK
        """
        # TODO: 集成真实的微信支付 API
        import qrcode
        from io import BytesIO
        import base64

        # 模拟支付 URL
        payment_url = f"https://pay.weixin.qq.com/mock-pay?order_no={order.order_no}"

        # 生成模拟二维码
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(payment_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()

        return payment_url, f"data:image/png;base64,{img_str}"

    def _call_alipay_api(self, order: Order) -> tuple[str, str]:
        """
        调用支付宝 API（模拟实现）
        实际应该使用支付宝 Python SDK
        """
        # TODO: 集成真实的支付宝 API
        import qrcode
        from io import BytesIO
        import base64

        # 模拟支付 URL
        payment_url = f"https://openapi.alipay.com/mock-pay?order_no={order.order_no}"

        # 生成模拟二维码
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(payment_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()

        return payment_url, f"data:image/png;base64,{img_str}"

    def _verify_wechat_sign(self, data: dict) -> bool:
        """验证微信支付签名"""
        # TODO: 实现真实的签名验证
        return True

    def _verify_alipay_sign(self, data: dict) -> bool:
        """验证支付宝签名"""
        # TODO: 实现真实的签名验证
        return True

    def _activate_subscription(self, order: Order):
        """
        激活订阅
        """
        # 查找或创建订阅
        subscription = self.db.query(Subscription).filter(
            Subscription.organization_id == order.organization_id
        ).first()

        # 计算订阅周期
        from datetime import timedelta
        now = datetime.utcnow()

        if order.billing_cycle == BillingCycle.MONTHLY:
            period_end = now + timedelta(days=30)
        else:  # yearly
            period_end = now + timedelta(days=365)

        if subscription:
            # 更新现有订阅
            subscription.plan_type = order.plan_type
            subscription.status = SubscriptionStatus.ACTIVE
            subscription.billing_cycle = order.billing_cycle
            subscription.current_period_start = now
            subscription.current_period_end = period_end
        else:
            # 创建新订阅
            subscription = Subscription(
                organization_id=order.organization_id,
                plan_type=order.plan_type,
                status=SubscriptionStatus.ACTIVE,
                billing_cycle=order.billing_cycle,
                current_period_start=now,
                current_period_end=period_end,
            )
            self.db.add(subscription)

        # 更新组织计划
        organization = self.db.query(Organization).filter(
            Organization.id == order.organization_id
        ).first()
        if organization:
            organization.plan_type = order.plan_type

        self.db.commit()
