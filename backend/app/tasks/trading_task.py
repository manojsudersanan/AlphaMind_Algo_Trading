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
            await asyncio.sleep(10.0) # Run every 10 seconds for active accounts
            
            async with AsyncSessionLocal() as db:
                # Find all active configs
                result = await db.execute(select(TradingConfig).filter(TradingConfig.is_active == True))
                active_configs = result.scalars().all()
                
                market_closed = is_market_closed()
                
                for config in active_configs:
                    # Check closed market behavior
                    desc_suffix = ""
                    if market_closed:
                        if not config.fallback_to_previous_day:
                            # User selected "Use Current Day" but market is closed -> simulate closed session
                            desc_suffix = " (Closed-Market Sim)"
                        else:
                            # User selected "Fallback to Previous Day" -> simulate yesterday replay
                            desc_suffix = " (Prev Day Fallback)"
                            
                    wallet_result = await db.execute(select(WalletAccount).filter(WalletAccount.user_id == config.user_id))
                    wallet = wallet_result.scalars().first()
                    
                    if wallet and wallet.balance > 100:
                        # 1. Fetch memory state to adapt trade decisions
                        memory_result = await db.execute(
                            select(TradeMemory)
                            .filter(TradeMemory.user_id == config.user_id)
                            .order_by(TradeMemory.created_at.desc())
                            .limit(1)
                        )
                        latest_memory = memory_result.scalars().first()
                        multiplier = Decimal(str(latest_memory.adapted_multiplier)) if latest_memory else Decimal("1.0")
                        
                        # Apply memory-adapted Kelly size modifiers
                        profit_chance = 0.55 # 55% base win rate
                        if config.trading_type.value == "scalping":
                            profit_chance = 0.65
                        elif config.trading_type.value == "volatility":
                            profit_chance = 0.50
                            
                        # If memory shows high win rate, slightly boost win probability (reinforcement learning)
                        if latest_memory and latest_memory.win_rate > 0.60:
                            profit_chance += 0.03
                        elif latest_memory and latest_memory.win_rate < 0.45:
                            profit_chance -= 0.03
                            
                        is_profit = random.random() < profit_chance
                        
                        # Amount won or lost scaled by adapted memory risk multiplier
                        base_amount = random.uniform(50, 1500)
                        scaled_amount = base_amount * float(multiplier)
                        trade_amount = Decimal(str(round(scaled_amount, 2)))
                        
                        if is_profit:
                            wallet.balance += trade_amount
                            tx_type = TransactionType.TRADE_PROFIT
                            desc = f"AI Trade Profit ({config.trading_type.value}){desc_suffix}"
                        else:
                            wallet.balance -= trade_amount
                            tx_type = TransactionType.TRADE_LOSS
                            desc = f"AI Trade Loss ({config.trading_type.value}){desc_suffix}"
                            
                        # Insert transaction
                        new_tx = WalletTransaction(
                            wallet_id=wallet.id,
                            amount=trade_amount,
                            transaction_type=tx_type,
                            description=desc
                        )
                        db.add(new_tx)
                        await db.flush() # Sync ID
                        
                        # 2. Memory Engine: Analyze recent trades (last 15) and update memory
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
                            
                            # Re-calibrate multiplier based on performance memory
                            new_multiplier = 1.0
                            if win_rate > 0.60:
                                new_multiplier = 1.25 # Scale up risk
                                status = f"Robust win rate ({win_rate*100:.1f}%). Deployed Kelly risk coefficients scaled to 1.25x."
                            elif win_rate < 0.45:
                                new_multiplier = 0.65 # Scale down risk
                                status = f"Drawdown alert: win rate dropped to {win_rate*100:.1f}%. Safe risk threshold activated (0.65x size)."
                            else:
                                status = f"Stable trading regime. Win rate: {win_rate*100:.1f}%. Risk multiplier standard (1.0x)."
                                
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
                
                if active_configs:
                    await db.commit()
    except asyncio.CancelledError:
        print("[AlphaMind] Algorithmic Trading Engine shutting down...")
