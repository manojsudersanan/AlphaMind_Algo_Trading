import asyncio
import random
from app.api.websockets.manager import manager

async def live_market_feed_simulator():
    """
    Simulates high-frequency incoming ticks from Zerodha/NSE in a native background loop.
    Replaces Apache Kafka / Celery Beat in the original architecture.
    """
    print("[AlphaMind] Starting Simulated Live Market OHLCV Engine...")
    symbols = ["NIFTY 50", "BANKNIFTY", "RELIANCE", "HDFCBANK", "INFY"]
    
    # Base prices
    prices = {s: random.uniform(1000, 25000) for s in symbols}
    
    try:
        while True:
            await asyncio.sleep(1.0) # 1-second ticks
            
            # Generate random walk tick 
            tick_data = []
            for symbol in symbols:
                volatility = random.uniform(-0.002, 0.002)
                prices[symbol] *= (1 + volatility)
                
                tick_data.append({
                    "symbol": symbol,
                    "price": round(prices[symbol], 2),
                    "change_pct": round(volatility * 100, 3)
                })
                
            payload = {
                "type": "market_tick",
                "data": tick_data
            }
            
            # Broadcast to all connected clients
            await manager.broadcast_market_data(payload)
            
    except asyncio.CancelledError:
        print("[AlphaMind] Live Market Feed Simulator shutting down...")
