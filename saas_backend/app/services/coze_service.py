"""
Coze API 服务封装
集成 Coze AI 对话功能
"""
import os
import httpx
from typing import AsyncIterator, Optional, Dict, Any
from datetime import datetime
import json

from app.core.config import settings


class CozeService:
    """Coze API 服务类"""

    def __init__(self):
        """初始化 Coze 服务"""
        # 从环境变量读取 Coze API Token
        self.api_token = os.getenv("COZE_API_TOKEN")
        self.base_url = os.getenv("COZE_API_BASE", "https://api.coze.com")
        self.timeout = 60.0

    async def _get_headers(self) -> Dict[str, str]:
        """获取请求头"""
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def chat(
        self,
        bot_id: str,
        message: str,
        conversation_id: Optional[str] = None,
        user_id: str = "default_user",
    ) -> Dict[str, Any]:
        """
        发送聊天消息（非流式）

        Args:
            bot_id: Coze Bot ID
            message: 用户消息
            conversation_id: 对话 ID（可选）
            user_id: 用户 ID

        Returns:
            API 响应数据
        """
        url = f"{self.base_url}/v3/chat"

        payload = {
            "bot_id": bot_id,
            "user_id": user_id,
            "additional_messages": [
                {
                    "role": "user",
                    "content": message,
                    "content_type": "text"
                }
            ]
        }

        if conversation_id:
            payload["conversation_id"] = conversation_id

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                url,
                headers=await self._get_headers(),
                json=payload,
            )

            response.raise_for_status()
            return response.json()

    async def chat_stream(
        self,
        bot_id: str,
        message: str,
        conversation_id: Optional[str] = None,
        user_id: str = "default_user",
    ) -> AsyncIterator[Dict[str, Any]]:
        """
        发送聊天消息（流式）

        Args:
            bot_id: Coze Bot ID
            message: 用户消息
            conversation_id: 对话 ID（可选）
            user_id: 用户 ID

        Yields:
            流式响应数据块
        """
        url = f"{self.base_url}/v3/chat"

        payload = {
            "bot_id": bot_id,
            "user_id": user_id,
            "additional_messages": [
                {
                    "role": "user",
                    "content": message,
                    "content_type": "text"
                }
            ],
            "stream": True
        }

        if conversation_id:
            payload["conversation_id"] = conversation_id

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            async with client.stream(
                "POST",
                url,
                headers=await self._get_headers(),
                json=payload,
            ) as response:
                response.raise_for_status()

                async for line in response.aiter_lines():
                    if line.startswith("data:"):
                        data = line[5:].strip()

                        if data == "[DONE]":
                            yield {"type": "done"}
                            break

                        try:
                            chunk = json.loads(data)
                            yield chunk
                        except json.JSONDecodeError:
                            # 跳过无效的 JSON
                            continue

    async def create_conversation(
        self,
        bot_id: str,
        user_id: str = "default_user",
    ) -> Dict[str, Any]:
        """
        创建新对话

        Args:
            bot_id: Coze Bot ID
            user_id: 用户 ID

        Returns:
            对话信息
        """
        # Coze API v3 中，对话在首次发送消息时自动创建
        # 这里返回模拟数据
        return {
            "id": f"conv_{datetime.utcnow().timestamp()}",
            "bot_id": bot_id,
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
        }

    async def get_conversation(
        self,
        conversation_id: str,
        bot_id: str,
    ) -> Dict[str, Any]:
        """
        获取对话详情

        Args:
            conversation_id: 对话 ID
            bot_id: Bot ID

        Returns:
            对话信息
        """
        url = f"{self.base_url}/v3/chat/retrieve"

        payload = {
            "bot_id": bot_id,
            "conversation_id": conversation_id,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                url,
                headers=await self._get_headers(),
                json=payload,
            )

            response.raise_for_status()
            return response.json()

    async def get_conversation_messages(
        self,
        conversation_id: str,
        bot_id: str,
    ) -> Dict[str, Any]:
        """
        获取对话消息列表

        Args:
            conversation_id: 对话 ID
            bot_id: Bot ID

        Returns:
            消息列表
        """
        url = f"{self.base_url}/v3/chat/message/list"

        payload = {
            "bot_id": bot_id,
            "conversation_id": conversation_id,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                url,
                headers=await self._get_headers(),
                json=payload,
            )

            response.raise_for_status()
            return response.json()

    async def cancel_chat(
        self,
        conversation_id: str,
        bot_id: str,
    ) -> Dict[str, Any]:
        """
        取消正在进行的对话

        Args:
            conversation_id: 对话 ID
            bot_id: Bot ID

        Returns:
            取消结果
        """
        url = f"{self.base_url}/v3/chat/cancel"

        payload = {
            "bot_id": bot_id,
            "conversation_id": conversation_id,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                url,
                headers=await self._get_headers(),
                json=payload,
            )

            response.raise_for_status()
            return response.json()


# 全局 Coze 服务实例
coze_service = CozeService()
