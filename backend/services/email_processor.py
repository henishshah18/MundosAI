from __future__ import annotations

import base64
import json
from typing import Any, Dict

from app.db.database import get_database


async def process_gmail_webhook(payload: Dict[str, Any]) -> None:
    # 1. Decode Base64 message.data
    message = payload.get("message", {})
    data_b64: str | None = message.get("data")
    if not data_b64:
        return
    try:
        decoded_bytes = base64.b64decode(data_b64)
        decoded_str = decoded_bytes.decode("utf-8")
    except Exception:
        return

    # 2. Mock fetch of Gmail thread -> extract thread_id and content
    try:
        parsed = json.loads(decoded_str)
    except json.JSONDecodeError:
        parsed = {"thread_id": "mock-thread-id", "content": decoded_str}

    thread_id = parsed.get("thread_id", "mock-thread-id")
    content = parsed.get("content", "")

    # 3. Find campaign by channel.thread_id
    db = await get_database()
    campaign = await db["campaigns"].find_one({"channel.thread_id": thread_id})
    if not campaign:
        return

    # 4. Placeholder: hand off to AI agent (not implemented yet)
    # For now we do nothing further.
    return


