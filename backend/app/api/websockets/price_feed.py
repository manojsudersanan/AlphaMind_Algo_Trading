from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Any
import json
import logging

from app.api.websockets.manager import manager
from app.api.dependencies import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws/market_data")
async def websocket_market_data(websocket: WebSocket):
    """
    Public connection for live OHLCV price feeds.
    """
    await manager.connect(websocket, "market_data")
    try:
        while True:
            # We just keep the connection open.
            # Data is pushed to subscribers by the background task.
            data = await websocket.receive_text()
            # Handle incoming ping/pong or client commands if necessary
    except WebSocketDisconnect:
        manager.disconnect(websocket, "market_data")
        logger.info("Client disconnected from market_data feed")

@router.websocket("/ws/signals")
async def websocket_ai_signals(websocket: WebSocket, token: str):
    """
    Authenticated connection for personalized AI Signals and Order Updates.
    """
    # In a real app we'd validate the token here. Simulated for local:
    user_id = token
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Could receive manual trade confirmations here
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        logger.info(f"User {user_id} disconnected from signaling feed")
