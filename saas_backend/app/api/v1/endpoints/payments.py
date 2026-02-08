"""
支付相关 API 端点
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from uuid import UUID
from decimal import Decimal

from app.api.v1.endpoints import deps
from app.schemas.payment import PaymentResponse, WechatPayCreate, AlipayCreate, Order
from app.services.payment_service import PaymentService
from app.models.user import User

router = APIRouter()


@router.post("/wechat/create", response_model=PaymentResponse)
def create_wechat_payment(
    payment_in: WechatPayCreate,
    organization_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    创建微信支付订单
    """
    payment_service = PaymentService(db)

    try:
        response = payment_service.create_wechat_payment(
            organization_id=organization_id,
            user_id=current_user.id,
            amount=payment_in.amount,
            plan_type=payment_in.plan_type,
            billing_cycle=payment_in.billing_cycle,
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/alipay/create", response_model=PaymentResponse)
def create_alipay_payment(
    payment_in: AlipayCreate,
    organization_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    创建支付宝支付订单
    """
    payment_service = PaymentService(db)

    try:
        response = payment_service.create_alipay_payment(
            organization_id=organization_id,
            user_id=current_user.id,
            amount=payment_in.amount,
            plan_type=payment_in.plan_type,
            billing_cycle=payment_in.billing_cycle,
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/callback/wechat")
def wechat_pay_callback(
    request: Request,
    db: Session = Depends(deps.get_db),
):
    """
    微信支付回调
    """
    import xml.etree.ElementTree as ET

    # 获取回调数据
    body = request.body()
    xml_data = ET.fromstring(body)

    callback_data = {}
    for child in xml_data:
        callback_data[child.tag] = child.text

    payment_service = PaymentService(db)

    try:
        success = payment_service.handle_wechat_callback(callback_data)

        if success:
            # 返回微信要求的 XML 格式
            response_xml = """
            <xml>
              <return_code><![CDATA[SUCCESS]]></return_code>
              <return_msg><![CDATA[OK]]></return_msg>
            </xml>
            """
            return Response(content=response_xml, media_type="application/xml")
        else:
            response_xml = """
            <xml>
              <return_code><![CDATA[FAIL]]></return_code>
              <return_msg><![CDATA[签名验证失败]]></return_msg>
            </xml>
            """
            return Response(content=response_xml, media_type="application/xml")

    except Exception as e:
        response_xml = f"""
        <xml>
          <return_code><![CDATA[FAIL]]></return_code>
          <return_msg><![CDATA[{str(e)}]]></return_msg>
        </xml>
        """
        return Response(content=response_xml, media_type="application/xml")


@router.post("/callback/alipay")
def alipay_callback(
    request: Request,
    db: Session = Depends(deps.get_db),
):
    """
    支付宝回调
    """
    # 获取回调数据
    callback_data = dict(request.query_params)

    payment_service = PaymentService(db)

    try:
        success = payment_service.handle_alipay_callback(callback_data)

        if success:
            return "success"
        else:
            return "fail"

    except Exception as e:
        return "fail"


@router.get("/orders/{order_id}", response_model=Order)
def get_order(
    order_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    查询订单状态
    """
    from app.models.order import Order as OrderModel

    order = db.query(OrderModel).filter(
        OrderModel.id == order_id,
        OrderModel.user_id == current_user.id,
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    return order


@router.post("/orders/{order_id}/refund")
def refund_order(
    order_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    申请退款
    """
    from app.models.order import Order as OrderModel, OrderStatus

    order = db.query(OrderModel).filter(
        OrderModel.id == order_id,
        OrderModel.user_id == current_user.id,
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    if order.status != OrderStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only paid orders can be refunded"
        )

    # TODO: 调用微信支付或支付宝退款 API

    order.status = OrderStatus.REFUNDED
    db.commit()

    return {"message": "Refund request submitted"}
