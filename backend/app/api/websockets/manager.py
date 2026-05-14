from typing import Dict, List, Any
from fastapi import WebSocket
import asyncio
import json

class ConnectionManager:
    def __init__(self):
        # Maps user_id / channel to active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.market_subscribers: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)
        
        if channel == "market_data":
            self.market_subscribers.append(websocket)

    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.active_connections and websocket in self.active_connections[channel]:
            self.active_connections[channel].remove(websocket)
        if channel == "market_data" and websocket in self.market_subscribers:
            self.market_subscribers.remove(websocket)

    async def broadcast_market_data(self, data: dict):
        dead_connections = []
        message = json.dumps(data)
        for connection in self.market_subscribers:
            try:
                await connection.send_text(message)
            except Exception:
                dead_connections.append(connection)
                
        for dead in dead_connections:
            self.disconnect(dead, "market_data")

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            dead_connections = []
            msg_str = json.dumps(message)
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(msg_str)
                except Exception:
                    dead_connections.append(connection)
            
            for dead in dead_connections:
                self.disconnect(dead, user_id)

manager = ConnectionManager()
