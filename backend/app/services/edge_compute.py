import asyncio
import uuid
from typing import List, Dict, Any
from datetime import datetime

class EdgeComputeNode:
    """
    Edge Computation System for AlphaMind Platform.
    Handles online/offline progress of trading algorithms.
    Caches signals and state locally when disconnected from main broker/exchange,
    and intelligently syncs and resolves pending states when reconnected.
    """
    def __init__(self):
        self.is_online = True
        self.offline_queue: List[Dict[str, Any]] = []
        self.local_cache_db: Dict[str, Any] = {}
        self.last_sync_time = datetime.now()

    def set_online_status(self, status: bool):
        was_offline = not self.is_online
        self.is_online = status
        
        if status and was_offline:
            asyncio.create_task(self._sync_to_cloud())
            
    async def process_trade_signal(self, symbol: str, action: str, confidence: float):
        trade_data = {
            "id": str(uuid.uuid4()),
            "symbol": symbol,
            "action": action,
            "confidence": confidence,
            "timestamp": datetime.now().isoformat()
        }
        
        if self.is_online:
            # Transmit directly to broker/cloud
            result = await self._execute_live(trade_data)
            return result
        else:
            # Edge computation mode: Buffer and compute local delta
            print(f"[EDGE NODE] Offline - Buffering {action} signal for {symbol}")
            self.offline_queue.append(trade_data)
            self._update_local_computation(trade_data)
            return {"status": "buffered_at_edge", "trade": trade_data}

    def _update_local_computation(self, trade: dict):
        # Perform partial computation at the edge so the UI reflects the expected state
        sym = trade["symbol"]
        if sym not in self.local_cache_db:
            self.local_cache_db[sym] = {"pending_volume": 0}
            
        if trade["action"] == "BUY":
            self.local_cache_db[sym]["pending_volume"] += 1
        else:
            self.local_cache_db[sym]["pending_volume"] -= 1

    async def _execute_live(self, trade: dict):
        # Simulate network delay for live execution
        await asyncio.sleep(0.1)
        return {"status": "executed_live", "trade": trade}

    async def _sync_to_cloud(self):
        print(f"[EDGE NODE] Reconnected. Syncing {len(self.offline_queue)} pending edge-computed signals...")
        while self.offline_queue:
            trade = self.offline_queue.pop(0)
            await self._execute_live(trade)
            print(f"[EDGE NODE] Synced trade: {trade['id']}")
            
        self.local_cache_db.clear()
        self.last_sync_time = datetime.now()
        print("[EDGE NODE] Sync complete.")

    def get_status(self):
        return {
            "online": self.is_online,
            "pending_offline_tasks": len(self.offline_queue),
            "last_sync": self.last_sync_time.isoformat(),
            "edge_cache_active": len(self.local_cache_db) > 0
        }

# Global Singleton Instance
edge_node = EdgeComputeNode()
