import asyncio
from app.api.websockets.manager import manager
from alphamind_ai.agents.ppo_agent import PPOTradingAgent

class SignalGenerator:
    """
    Substitutes the Apache Kafka messaging queue for Native deployment.
    Listens for internal OHLCV updates, feeds them to the PPO model, 
    and broadcasts "BUY/SELL/HOLD" actions via standard WebSockets.
    """
    def __init__(self, agent: PPOTradingAgent):
        self.agent = agent
        
    async def process_and_broadcast(self, live_observation, user_id: str, symbol: str):
        """
        Processes normalized numerical live_observation into actionable ML intelligence.
        """
        # 1. PPO Forward Pass (Deterministic Strategy Inference)
        try:
            action_idx = self.agent.predict([live_observation])
            
            action_map = {0: "SELL", 1: "HOLD", 2: "BUY"}
            action_str = action_map.get(int(action_idx), "HOLD")
            
            # Simulated confidence metric 
            confidence = 82.5 if action_idx != 1 else 99.0 
            
            payload = {
                "symbol": symbol,
                "action": action_str,
                "confidence_pct": confidence,
                "timestamp": "now" # Abstracted in production
            }
            
            # 2. Transmit actionable intelligence back to standard User Dashboard
            print(f"[{symbol}] AI Emitted: {action_str} ({confidence}%) -> {user_id}'s WS Channel")
            await manager.send_personal_message(payload, user_id=user_id)
            
        except Exception as e:
            print(f"[SignalGenerator] Inference failure: {e}")
