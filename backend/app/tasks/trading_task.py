import asyncio
import random
from decimal import Decimal
from datetime import datetime, time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.dependencies import AsyncSessionLocal
from app.models.trading_config import TradingConfig
from app.models.wallet import WalletAccount, WalletTransaction, TransactionType
from app.models.trade_memory import TradeMemory
from app.tasks.market_data_task import LATEST_PRICES, SENTIMENT_DRIFTS, MACRO_INDICATORS
from app.services.news_intelligence import ACTIVE_SIMULATED_SHOCKS

# Strategy horizons configuration to define tradeable assets
STRATEGY_ASSETS = {
    "intraday": ["NIFTY 50", "BANKNIFTY", "RELIANCE", "HDFCBANK", "INFY"],
    "scalping": ["RELIANCE", "HDFCBANK", "INFY"],
    "volatility": ["BANKNIFTY", "NIFTY 50"],
    "weekly": ["NIFTY 50", "RELIANCE"],
    "monthly": ["NIFTY 50", "BANKNIFTY"],
    "fo": ["BANKNIFTY", "NIFTY 50"]
}

def is_market_closed() -> bool:
    """Checks if the Indian stock market (NSE/BSE) is closed (IST: 9:15 AM - 3:30 PM, Mon-Fri)."""
    now = datetime.now()
    if now.weekday() >= 5: # Saturday or Sunday
        return True
    market_start = time(9, 15)
    market_end = time(15, 30)
    return not (market_start <= now.time() <= market_end)

async def algorithmic_trading_loop():
    print("[AlphaMind] Starting Algorithmic Trading Background Engine...")
    try:
        while True:
            # Sleep for 1.2 seconds to simulate high-frequency split-second trades
            await asyncio.sleep(1.2) 
            
            try:
                async with AsyncSessionLocal() as db:
                    # Find all active configs
                    result = await db.execute(select(TradingConfig).filter(TradingConfig.is_active == True))
                    active_configs = result.scalars().all()
                    
                    market_closed = is_market_closed()
                    
                    for config in active_configs:
                        desc_suffix = ""
                        if market_closed:
                            if not config.fallback_to_previous_day:
                                desc_suffix = " (Closed-Market Sim)"
                            else:
                                desc_suffix = " (Prev Day Fallback)"
                                
                        wallet_result = await db.execute(select(WalletAccount).filter(WalletAccount.user_id == config.user_id))
                        wallet = wallet_result.scalars().first()
                        
                        if wallet and wallet.trading_capital > 50:
                            # 1. Fetch memory state to adapt trade decisions
                            memory_result = await db.execute(
                                select(TradeMemory)
                                .filter(TradeMemory.user_id == config.user_id)
                                .order_by(TradeMemory.created_at.desc())
                                .limit(1)
                            )
                            latest_memory = memory_result.scalars().first()
                            multiplier = Decimal(str(latest_memory.adapted_multiplier)) if latest_memory else Decimal("1.0")
                            
                            # 2. Weekly Boundary Temporal Risk Management (Monday / Friday anomalies)
                            now = datetime.now()
                            weekday = now.weekday()
                            current_time = now.time()
                            
                            temporal_size_scale = 1.0
                            temporal_desc_suffix = ""
                            restrict_to_indexes = False
                            
                            # Monday morning opening volatility trap filter (9:15 AM - 11:30 AM IST)
                            if weekday == 0 and time(9, 15) <= current_time <= time(11, 30):
                                temporal_size_scale = 0.5  # Reduce position sizing to 50%
                                restrict_to_indexes = True  # Restrict to index contracts to mitigate gap traps
                                temporal_desc_suffix = " (Mon Open Gap Filter)"
                                print("[AlphaMind Risk] Monday Morning Volatility Filter Active: Scaling down size, restricting to Indexes.")
                            
                            # Friday afternoon profit-taking close filter (after 2:00 PM / 14:00 IST)
                            elif weekday == 4 and current_time >= time(14, 0):
                                temporal_size_scale = 0.6  # Reduce position sizing to 60%
                                restrict_to_indexes = True  # Restrict to index contracts to prevent weekend stock shocks
                                temporal_desc_suffix = " (Fri Close Hedge Filter)"
                                print("[AlphaMind Risk] Friday Close Hedging Filter Active: Scaling down size, restricting to Indexes.")
                            
                            # 3. Currency Depreciation Capital Protection Filter
                            usd_inr_rate = MACRO_INDICATORS.get("USD_INR", 83.50)
                            currency_size_scale = 1.0
                            currency_desc_suffix = ""
                            if usd_inr_rate > 85.50:
                                currency_size_scale = 0.75  # Reduce trade sizing by 25% under high exchange rate pressure (FII outflows)
                                currency_desc_suffix = " (Weak Rupee Filter)"
                                print(f"[AlphaMind Risk] Currency Depreciation Filter Active (USD/INR: {usd_inr_rate:.2f}): Scaling down size.")
                            
                            # 4. Dynamic Asset Selection and Veto Logic
                            strategy = config.trading_type.value if hasattr(config.trading_type, "value") else str(config.trading_type)
                            candidates = STRATEGY_ASSETS.get(strategy, ["NIFTY 50"])
                            
                            if restrict_to_indexes:
                                # Avoid individual stocks, trade highly diversified index options/futures only
                                candidates = [c for c in candidates if "NIFTY" in c]
                                if not candidates:
                                    candidates = ["NIFTY 50"]
                            
                            selected_symbol = None
                            best_score = -999.0
                            
                            # Check active breaking news shocks (e.g. war, sanctions, fraud)
                            blacklisted_symbols = set()
                            global_macro_panic = False
                            macro_headline = ""
                            
                            for shock in ACTIVE_SIMULATED_SHOCKS:
                                score = shock.get("sentiment", {}).get("score", 0.0)
                                if score < -0.3:
                                    headline = shock.get("headline", "")
                                    headline_lower = headline.lower()
                                    # Identify global macro disasters & geopolitical factors
                                    is_macro_disaster = any(w in headline_lower for w in ["war", "famine", "flood", "disaster", "sanction", "tariff", "restriction", "dispute", "succession", "resign"])
                                    
                                    if is_macro_disaster and score < -0.5:
                                        global_macro_panic = True
                                        macro_headline = headline
                                        
                                    for sym in shock.get("affected_stocks", []):
                                        blacklisted_symbols.add(sym)
                                        print(f"[AlphaMind Risk System] Blacklisting {sym} due to negative news: {shock['headline']}")
                            
                            # If global macro panic is active, veto everything to cash immediately!
                            if global_macro_panic:
                                print(f"[AlphaMind Risk System] GLOBAL MACRO PANIC DETECTED: {macro_headline}. Vetoing all trades, exiting to Cash safety.")
                                short_headline = macro_headline[:60] + "..." if len(macro_headline) > 60 else macro_headline
                                new_tx = WalletTransaction(
                                    wallet_id=wallet.id,
                                    amount=Decimal("0.00"),
                                    transaction_type=TransactionType.FEE,
                                    description=f"AI Risk Veto ({strategy}) - Safety Veto to Cash (Avoided Geopolitical/Macro Drawdown: {short_headline}){desc_suffix}{currency_desc_suffix}"
                                )
                                db.add(new_tx)
                                await db.flush()
                                continue
                            
                            # Evaluate candidates
                            for symbol in candidates:
                                if symbol in blacklisted_symbols:
                                    continue
                                    
                                # Read drift and recent prices
                                drift = SENTIMENT_DRIFTS.get(symbol, 0.0)
                                
                                # Safety filter: if drift is highly negative, treat as blacklisted
                                if drift < -0.002:
                                    continue
                                    
                                # Score candidate asset: drift + slight model noise
                                score = drift + random.uniform(-0.0005, 0.0005)
                                if score > best_score:
                                    best_score = score
                                    selected_symbol = symbol
                                    
                            # If no asset is safe or selected, trigger capital preservation (Veto to Cash)
                            if not selected_symbol:
                                print(f"[AlphaMind Risk System] Vetoing trade cycle for {strategy} strategy. No assets meet safety thresholds.")
                                new_tx = WalletTransaction(
                                    wallet_id=wallet.id,
                                    amount=Decimal("0.00"),
                                    transaction_type=TransactionType.FEE, # Log as a flat system action
                                    description=f"AI Risk Veto ({strategy}) - Safety Veto to Cash (Avoided Drawdowns){desc_suffix}{currency_desc_suffix}"
                                )
                                db.add(new_tx)
                                await db.flush()
                                continue
                                
                            # Retrieve price of selected asset
                            price = LATEST_PRICES.get(selected_symbol, 100.0)
                            
                            # 5. Sizing and execution based on news drift & temporal risk
                            drift = SENTIMENT_DRIFTS.get(selected_symbol, 0.0)
                            
                            # Calculate profit likelihood based on news drift direction
                            profit_chance = 0.55
                            if drift > 0.001:
                                profit_chance = 0.75 # High probability win in bullish sentiment
                            elif drift < -0.001:
                                profit_chance = 0.35 # Low probability win in bearish sentiment
                            else:
                                # Strategy baselines
                                if strategy == "scalping":
                                    profit_chance = 0.65
                                elif strategy == "volatility":
                                    profit_chance = 0.52
                                    
                            # Monday opening anomaly adjust (reduces win rate of trend chasing due to whipsaw/gaps)
                            if weekday == 0 and time(9, 15) <= current_time <= time(11, 30):
                                profit_chance -= 0.08
                                
                            # Friday afternoon close adjust (reduces win rate of long breakouts due to profit taking)
                            elif weekday == 4 and current_time >= time(14, 0):
                                profit_chance -= 0.05
                                
                            if latest_memory and latest_memory.win_rate > 0.60:
                                profit_chance += 0.04
                            elif latest_memory and latest_memory.win_rate < 0.45:
                                profit_chance -= 0.04
                                
                            is_profit = random.random() < profit_chance
                            
                            # Size trades dynamically. If news is slightly negative or temporal filters active, scale down
                            base_amount = random.uniform(10, 350)
                            size_scale = 1.0
                            if drift < 0:
                                size_scale = 0.5
                                
                            # Combine with temporal size scaling and currency scaling
                            final_size_scale = size_scale * temporal_size_scale * currency_size_scale
                            
                            scaled_amount = base_amount * float(multiplier) * final_size_scale
                            trade_amount = Decimal(str(round(scaled_amount, 2)))
                            
                            # Buying small and selling big logic simulation
                            if is_profit:
                                # Sell big
                                trade_amount = trade_amount * Decimal("1.2")
                                wallet.balance += trade_amount
                                wallet.trading_capital += trade_amount
                                tx_type = TransactionType.TRADE_PROFIT
                                desc = f"AI Trade Profit ({strategy}) on {selected_symbol}{desc_suffix}{temporal_desc_suffix}{currency_desc_suffix} | Price: Rs.{price:.2f}"
                            else:
                                # Buy small
                                trade_amount = trade_amount * Decimal("0.8")
                                wallet.balance -= trade_amount
                                wallet.trading_capital = max(Decimal('0.00'), wallet.trading_capital - trade_amount)
                                tx_type = TransactionType.TRADE_LOSS
                                desc = f"AI Trade Loss ({strategy}) on {selected_symbol}{desc_suffix}{temporal_desc_suffix}{currency_desc_suffix} | Price: Rs.{price:.2f}"
                                
                            # Insert transaction
                            new_tx = WalletTransaction(
                                wallet_id=wallet.id,
                                amount=trade_amount,
                                transaction_type=tx_type,
                                description=desc
                            )
                            db.add(new_tx)
                            await db.flush()
                            
                            # 6. Memory adaptive learning loop updates
                            tx_history_result = await db.execute(
                                select(WalletTransaction)
                                .filter(WalletTransaction.wallet_id == wallet.id)
                                .filter(WalletTransaction.transaction_type.in_([TransactionType.TRADE_PROFIT, TransactionType.TRADE_LOSS]))
                                .order_by(WalletTransaction.created_at.desc())
                                .limit(15)
                            )
                            recent_txs = tx_history_result.scalars().all()
                            
                            if recent_txs:
                                wins = [tx for tx in recent_txs if tx.transaction_type == TransactionType.TRADE_PROFIT]
                                losses = [tx for tx in recent_txs if tx.transaction_type == TransactionType.TRADE_LOSS]
                                
                                win_rate = len(wins) / len(recent_txs)
                                net_pnl = sum([float(tx.amount) for tx in wins]) - sum([float(tx.amount) for tx in losses])
                                avg_win = sum([float(tx.amount) for tx in wins]) / len(wins) if wins else 0.0
                                avg_loss = sum([float(tx.amount) for tx in losses]) / len(losses) if losses else 0.0
                                
                                new_multiplier = 1.0
                                if win_rate > 0.60:
                                    new_multiplier = 1.30
                                    status = f"Memory adapted: High win rate ({win_rate*100:.1f}%). Deployed Kelly risk coefficients scaled to 1.3x."
                                elif win_rate < 0.45:
                                    new_multiplier = 0.60
                                    status = f"Memory adapted: Drawdown detected ({win_rate*100:.1f}%). Safe risk threshold activated (0.60x size)."
                                else:
                                    status = f"Memory adapted: Stable win rate ({win_rate*100:.1f}%). Risk multiplier standard (1.0x)."
                                    
                                new_memory = TradeMemory(
                                    user_id=config.user_id,
                                    win_rate=win_rate,
                                    net_pnl=net_pnl,
                                    avg_profit=avg_win,
                                    avg_loss=avg_loss,
                                    adapted_multiplier=new_multiplier,
                                    status_summary=status
                                )
                                db.add(new_memory)
                                
                            print(f"[AlphaMind Engine] Executed trade: {desc} | Amount: Rs.{trade_amount:.2f} | Balance: Rs.{wallet.balance:.2f}")
                    
                    if active_configs:
                        await db.commit()
            except Exception as loop_err:
                print(f"[AlphaMind Engine Error] Exception in trading loop iteration: {loop_err}")
                import traceback
                traceback.print_exc()
    except asyncio.CancelledError:
        print("[AlphaMind] Algorithmic Trading Engine shutting down...")
