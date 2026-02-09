"""
聊天 API 端点（用户端核心功能）- 集成 Coze API
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json
import asyncio

from app.api.v1.endpoints import deps
from app.api.v1.endpoints.bots import get_current_org
from app.api.v1.endpoints.rbac import require_active_user
from app.schemas.conversation import ChatRequest, ChatResponse, ChatStreamChunk
from app.schemas.user import User
from app.models.conversation import Conversation as ConversationModel
from app.models.bot import Bot
from app.models.message import Message as MessageModel
from app.services.coze_service import coze_service

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(deps.get_db),
):
    """
    非流式聊天 - 集成 Coze API
    """
    org = get_current_org(current_user, db)

    # 验证 bot 是否存在且属于该组织
    bot = db.query(Bot).filter(
        Bot.id == request.bot_id,
        Bot.organization_id == org.id
    ).first()

    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found"
        )

    if not bot.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bot is not active"
        )

    # 获取或创建对话
    conversation = None
    if request.conversation_id:
        conversation = db.query(ConversationModel).filter(
            ConversationModel.id == request.conversation_id,
            ConversationModel.organization_id == org.id,
            ConversationModel.user_id == current_user.id
        ).first()

    if not conversation:
        conversation = ConversationModel(
            bot_id=bot.id,
            user_id=current_user.id,
            organization_id=org.id,
            title=request.message[:50] + "..." if len(request.message) > 50 else request.message,
            message_count=0
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    try:
        # 调用 Coze API
        coze_response = await coze_service.chat(
            bot_id=bot.bot_id,  # 使用 Coze bot ID
            message=request.message,
            conversation_id=conversation.conversation_id,
            user_id=str(current_user.id),
        )

        # 解析 Coze 响应
        # Coze API v3 响应格式参考: https://www.coze.com/docs/developer_guides/api_v3
        content = ""
        msg_id = None

        if "data" in coze_response:
            # 提取 AI 回复内容
            for item in coze_response.get("data", []):
                if item.get("type") == "answer":
                    content = item.get("content", "")
                    msg_id = item.get("id")
                    break

        # 保存用户消息
        user_message = MessageModel(
            conversation_id=conversation.id,
            user_id=current_user.id,
            role="user",
            content=request.message,
        )
        db.add(user_message)

        # 保存 AI 回复
        if content:
            ai_message = MessageModel(
                conversation_id=conversation.id,
                user_id=current_user.id,
                role="assistant",
                content=content,
                coze_message_id=msg_id,
            )
            db.add(ai_message)

        # 更新对话
        conversation.message_count += 2
        if coze_response.get("conversation_id"):
            conversation.conversation_id = coze_response["conversation_id"]

        db.commit()
        db.refresh(conversation)

        return ChatResponse(
            message_id=msg_id or "unknown",
            conversation_id=conversation.id,
            content=content or "抱歉，我暂时无法回答这个问题。",
            role="assistant",
            created_at=conversation.updated_at,
        )

    except Exception as e:
        # 记录错误但不要中断用户体验
        print(f"Coze API error: {str(e)}")

        # 返回模拟回复作为降级处理
        return ChatResponse(
            message_id=f"fallback_{conversation.id}",
            conversation_id=conversation.id,
            content="抱歉，AI 服务暂时不可用。请稍后重试。",
            role="assistant",
            created_at=conversation.updated_at,
        )


@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(deps.get_db),
):
    """
    流式聊天 - 集成 Coze API (SSE)
    """
    org = get_current_org(current_user, db)

    # 验证 bot 是否存在且属于该组织
    bot = db.query(Bot).filter(
        Bot.id == request.bot_id,
        Bot.organization_id == org.id
    ).first()

    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found"
        )

    if not bot.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bot is not active"
        )

    # 获取或创建对话
    conversation = None
    if request.conversation_id:
        conversation = db.query(ConversationModel).filter(
            ConversationModel.id == request.conversation_id,
            ConversationModel.organization_id == org.id,
            ConversationModel.user_id == current_user.id
        ).first()

    if not conversation:
        conversation = ConversationModel(
            bot_id=bot.id,
            user_id=current_user.id,
            organization_id=org.id,
            title=request.message[:50] + "..." if len(request.message) > 50 else request.message,
            message_count=0
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    async def generate():
        """生成流式响应"""
        try:
            # 保存用户消息
            user_message = MessageModel(
                conversation_id=conversation.id,
                user_id=current_user.id,
                role="user",
                content=request.message,
            )
            db.add(user_message)
            db.commit()

            full_content = ""
            msg_id = None

            # 调用 Coze 流式 API
            async for chunk in coze_service.chat_stream(
                bot_id=bot.bot_id,
                message=request.message,
                conversation_id=conversation.conversation_id,
                user_id=str(current_user.id),
            ):
                # 转发 Coze 的流式响应
                if chunk.get("type") == "done":
                    # 完成
                    break
                elif chunk.get("type") == "error":
                    # 错误
                    error_chunk = ChatStreamChunk(
                        type="error",
                        error=chunk.get("error", "Unknown error")
                    )
                    yield f"data: {error_chunk.model_dump_json()}\n\n"
                    break
                else:
                    # 提取内容
                    if chunk.get("event") == "conversation.message.delta":
                        data = chunk.get("data", {})
                        content = data.get("content", "")
                        if content:
                            full_content += content
                            msg_id = data.get("id")

                            response_chunk = ChatStreamChunk(
                                type="message",
                                content=content,
                                message_id=msg_id,
                                conversation_id=conversation.id,
                            )
                            yield f"data: {response_chunk.model_dump_json()}\n\n"

                    # 更新 conversation_id
                    if chunk.get("conversation_id"):
                        conversation.conversation_id = chunk["conversation_id"]

            # 保存 AI 回复
            if full_content:
                ai_message = MessageModel(
                    conversation_id=conversation.id,
                    user_id=current_user.id,
                    role="assistant",
                    content=full_content,
                    coze_message_id=msg_id,
                )
                db.add(ai_message)

                # 更新对话消息计数
                conversation.message_count += 2
                if conversation.conversation_id:
                    db.commit()

            # 发送完成事件
            done_chunk = ChatStreamChunk(type="done")
            yield f"data: {done_chunk.model_dump_json()}\n\n"

        except Exception as e:
            # 发送错误事件
            import traceback
            print(f"Stream error: {str(e)}")
            print(traceback.format_exc())

            error_chunk = ChatStreamChunk(
                type="error",
                error=f"服务暂时不可用: {str(e)}"
            )
            yield f"data: {error_chunk.model_dump_json()}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
