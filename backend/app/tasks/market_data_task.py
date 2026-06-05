import asyncio
import random
from datetime import datetime
from app.api.websockets.manager import manager
from app.services.news_intelligence import get_market_intelligence, ACTIVE_SIMULATED_SHOCKS

# Global shared state for prices and sentiment
LATEST_PRICES = {
    "NIFTY 50": 22400.00,
    "BANKNIFTY": 48200.00,
    "RELIANCE": 2850.00,
    "HDFCBANK": 1520.00,
    "INFY": 1420.00,
}

SENTIMENT_DRIFTS = {
    "NIFTY 50": 0.0,
    "BANKNIFTY": 0.0,
    "RELIANCE": 0.0,
    "HDFCBANK": 0.0,
    "INFY": 0.0,
}

# Global macro indicators
MACRO_INDICATORS = {
    "GOLD_PRICE_10G": 72500.0,  # Base price in INR
    "USD_INR": 83.50,            # Base exchange rate
}

SHOCK_EVENTS = [
    {
        "symbol": "RELIANCE",
        "headline": "Reliance Industries faces regulatory probe over alleged overstated revenue in refinery segment.",
        "score": -0.90,
        "label": "BEARISH",
        "timeframe": "SHORT TERM",
        "desc": "Fraud Revenue Probe",
        "impact_map": {
            "RELIANCE": -0.045,
            "NIFTY 50": -0.006,
            "BANKNIFTY": -0.002,
            "HDFCBANK": -0.002,
            "INFY": -0.001
        }
    },
    {
        "symbol": "INFY",
        "headline": "Infosys secures massive $10B digital transformation contract with major global retailer.",
        "score": 0.85,
        "label": "BULLISH",
        "timeframe": "SHORT TERM",
        "desc": "Record Contract Win",
        "impact_map": {
            "INFY": 0.04,
            "NIFTY 50": 0.008,
            "BANKNIFTY": 0.002,
            "RELIANCE": 0.001,
            "HDFCBANK": 0.002
        }
    },
    {
        "symbol": "ALL",
        "headline": "Geopolitical War: Escalating military conflict in Middle East halts energy corridors; Brent crude spikes past $112/bbl.",
        "score": -0.85,
        "label": "BEARISH",
        "timeframe": "LONG TERM",
        "desc": "Geopolitical War",
        "impact_map": {
            "NIFTY 50": -0.025,
            "BANKNIFTY": -0.03,
            "RELIANCE": -0.012,
            "HDFCBANK": -0.02,
            "INFY": -0.015
        }
    },
    {
        "symbol": "INFY",
        "headline": "Trade Restrictions: US administration announces a surprise 25% import tariff on Indian IT consulting services.",
        "score": -0.80,
        "label": "BEARISH",
        "timeframe": "SHORT TERM",
        "desc": "IT Tariffs",
        "impact_map": {
            "INFY": -0.05,
            "NIFTY 50": -0.01,
            "BANKNIFTY": -0.002,
            "RELIANCE": -0.002,
            "HDFCBANK": -0.002
        }
    },
    {
        "symbol": "ALL",
        "headline": "Natural Disaster: Severe monsoon floods submerge major industrial belts and refineries in western India; supply chain halts.",
        "score": -0.75,
        "label": "BEARISH",
        "timeframe": "SHORT TERM",
        "desc": "Industrial Floods",
        "impact_map": {
            "RELIANCE": -0.04,
            "NIFTY 50": -0.015,
            "BANKNIFTY": -0.01,
            "HDFCBANK": -0.008,
            "INFY": -0.004
        }
    },
    {
        "symbol": "ALL",
        "headline": "Famine & Agriculture: Severe wheat and sugar export bans implemented as drought impacts regional output; inflation surges.",
        "score": -0.65,
        "label": "BEARISH",
        "timeframe": "LONG TERM",
        "desc": "Famine/Inflation Shock",
        "impact_map": {
            "NIFTY 50": -0.012,
            "BANKNIFTY": -0.01,
            "RELIANCE": -0.006,
            "HDFCBANK": -0.008,
            "INFY": -0.002
        }
    },
    {
        "symbol": "ALL",
        "headline": "Global Sanctions: Heavy banking sanctions imposed on exporting partners; international SWIFT settlements disrupted.",
        "score": -0.78,
        "label": "BEARISH",
        "timeframe": "SHORT TERM",
        "desc": "SWIFT Sanctions",
        "impact_map": {
            "BANKNIFTY": -0.04,
            "HDFCBANK": -0.035,
            "NIFTY 50": -0.018,
            "RELIANCE": -0.008,
            "INFY": -0.006
        }
    },
    {
        "symbol": "HDFCBANK",
        "headline": "Corporate Dispute: HDFC Bank Managing Director unexpectedly resigns following severe disagreements with the board; FII sell-off.",
        "score": -0.85,
        "label": "BEARISH",
        "timeframe": "SHORT TERM",
        "desc": "CEO Board Dispute",
        "impact_map": {
            "HDFCBANK": -0.048,
            "BANKNIFTY": -0.022,
            "NIFTY 50": -0.008,
            "RELIANCE": -0.001,
            "INFY": 0.0
        }
    },
    {
        "symbol": "RELIANCE",
        "headline": "Governance Crisis: Reliance Industries executive steps down amid succession planning disputes inside the board.",
        "score": -0.80,
        "label": "BEARISH",
        "timeframe": "SHORT TERM",
        "desc": "Executive Succession Dispute",
        "impact_map": {
            "RELIANCE": -0.04,
            "NIFTY 50": -0.012,
            "BANKNIFTY": -0.004,
            "HDFCBANK": -0.002,
            "INFY": 0.0
        }
    },
    {
        "symbol": "NIFTY 50",
        "headline": "Nifty rallies past historical resistance as IMF raises India GDP growth forecast to 7.8%.",
        "score": 0.80,
        "label": "BULLISH",
        "timeframe": "LONG TERM",
        "desc": "IMF GDP Growth Forecast",
        "impact_map": {
            "NIFTY 50": 0.018,
            "BANKNIFTY": 0.015,
            "RELIANCE": 0.01,
            "HDFCBANK": 0.012,
            "INFY": 0.008
        }
    }
]

async def live_market_feed_simulator():
    """
    Simulates high-frequency incoming ticks from Zerodha/NSE in a native background loop.
    Integrates news sentiment and random market shocks directly into the price walks.
    """
    print("[AlphaMind] Starting Simulated Live Market OHLCV Engine with News Integration...")
    symbols = list(LATEST_PRICES.keys())
    
    # Initialize base prices
    prices = {s: LATEST_PRICES[s] for s in symbols}
    
    iteration = 0
    shock_cooldown = 0
    
    try:
        while True:
            await asyncio.sleep(1.0) # 1-second ticks
            iteration += 1
            
            # Update Gold & USD/INR returns
            gold_vol = random.uniform(-0.0006, 0.0006)
            usd_vol = random.uniform(-0.0004, 0.0004)
            
            # Apply panic drifts to gold & usd_inr if war/sanctions/disasters are active
            for shock in ACTIVE_SIMULATED_SHOCKS:
                headline_lower = shock.get("headline", "").lower()
                if any(w in headline_lower for w in ["war", "disaster", "sanction", "famine"]):
                    gold_vol += 0.0022  # Gold spikes in global flight to safety
                    usd_vol += 0.0010   # USD strengthens (Rupee depreciates)
            
            # Step macro indicators
            MACRO_INDICATORS["GOLD_PRICE_10G"] *= (1 + gold_vol)
            MACRO_INDICATORS["USD_INR"] *= (1 + usd_vol)
            
            # Bounds
            MACRO_INDICATORS["USD_INR"] = max(78.0, min(89.0, MACRO_INDICATORS["USD_INR"]))
            MACRO_INDICATORS["GOLD_PRICE_10G"] = max(50000.0, MACRO_INDICATORS["GOLD_PRICE_10G"])
            
            # 1. Update news sentiment drifts periodically (every 10 seconds)
            if iteration % 10 == 0:
                try:
                    # Clear expired shocks (keep shocks active for 40 seconds)
                    if shock_cooldown > 0:
                        shock_cooldown -= 10
                        if shock_cooldown <= 0:
                            ACTIVE_SIMULATED_SHOCKS.clear()
                            print("[Market Simulator] Active news shock expired. Market returning to baseline.")
                    
                    # Fetch market intelligence (RSS + active shocks)
                    intel = await get_market_intelligence()
                    
                    # Reset drifts
                    for s in SENTIMENT_DRIFTS:
                        SENTIMENT_DRIFTS[s] = 0.0
                    
                    # Compute drift from news effects
                    all_effects = intel.get("short_term_effects", []) + intel.get("long_term_effects", [])
                    for effect in all_effects:
                        score = effect.get("sentiment", {}).get("score", 0.0)
                        for sym in effect.get("affected_stocks", []):
                            if sym in SENTIMENT_DRIFTS:
                                SENTIMENT_DRIFTS[sym] += score * 0.004
                                
                    # 2. Randomly trigger a simulated news shock (3% chance if no shock is active)
                    if len(ACTIVE_SIMULATED_SHOCKS) == 0 and random.random() < 0.03:
                        shock = random.choice(SHOCK_EVENTS)
                        shock_payload = {
                            "headline": shock["headline"],
                            "source": "Breaking News",
                            "affected_stocks": [shock["symbol"]] if shock["symbol"] != "ALL" else ["NIFTY 50", "BANKNIFTY", "RELIANCE", "HDFCBANK", "INFY"],
                            "sentiment": {
                                "score": shock["score"],
                                "label": shock["label"],
                                "confidence": 95
                            },
                            "timeframe": shock["timeframe"],
                            "timestamp": datetime.now().isoformat()
                        }
                        ACTIVE_SIMULATED_SHOCKS.append(shock_payload)
                        shock_cooldown = 40
                        
                        # Apply drifts based on impact map
                        if "impact_map" in shock:
                            for sym, drift_val in shock["impact_map"].items():
                                if sym in SENTIMENT_DRIFTS:
                                    SENTIMENT_DRIFTS[sym] = drift_val
                        else:
                            SENTIMENT_DRIFTS[shock["symbol"]] = shock["score"] * 0.012
                        
                        print(f"\n[Market News Shock] {shock['headline']} | Target: {shock['symbol']} | Score: {shock['score']}\n")
                        
                except Exception as news_err:
                    print(f"[Market Simulator] News sentiment drift error: {news_err}")
            
            # 3. Generate tick data based on random walk + news sentiment drift + macro correlations
            tick_data = []
            for symbol in symbols:
                rand_vol = random.uniform(-0.0012, 0.0012)
                drift = SENTIMENT_DRIFTS.get(symbol, 0.0)
                
                # Apply correlation pulls from Gold and Currency exchange rate
                gold_pull = -0.06 * gold_vol if gold_vol > 0 else 0.0  # Gold surges suck cash out of equities
                
                usd_pull = 0.0
                if symbol == "INFY":
                    usd_pull = 0.15 * usd_vol   # Weaker Rupee is positive for IT exporter revenues
                elif symbol in ["RELIANCE", "HDFCBANK"]:
                    usd_pull = -0.15 * usd_vol  # Importers & banking suffer under capital outflows
                elif symbol in ["NIFTY 50", "BANKNIFTY"]:
                    usd_pull = -0.10 * usd_vol  # Weak Rupee is generally negative for index FII flows
                
                volatility = rand_vol + drift + gold_pull + usd_pull
                
                prices[symbol] *= (1 + volatility)
                prices[symbol] = max(10.0, prices[symbol])
                
                LATEST_PRICES[symbol] = round(prices[symbol], 2)
                
                tick_data.append({
                    "symbol": symbol,
                    "price": round(prices[symbol], 2),
                    "change_pct": round(volatility * 100, 3)
                })
                
            payload = {
                "type": "market_tick",
                "data": tick_data,
                "macro": {
                    "gold": round(MACRO_INDICATORS["GOLD_PRICE_10G"], 2),
                    "usd_inr": round(MACRO_INDICATORS["USD_INR"], 2)
                }
            }
            
            await manager.broadcast_market_data(payload)
            
    except asyncio.CancelledError:
        print("[AlphaMind] Live Market Feed Simulator shutting down...")
