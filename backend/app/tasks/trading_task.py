import asyncio
import random
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import AsyncSessionLocal
from app.models.trading_config import TradingConfig
from app.models.wallet import WalletAccount, WalletTransaction, TransactionType

async def algorithmic_trading_loop():
    print("[AlphaMind] Starting Algorithmic Trading Background Engine...")
    try:
        while True:
            await asyncio.sleep(10.0) # Run every 10 seconds for active accounts
            
            async with AsyncSessionLocal() as db:
                from sqlalchemy.future import select
                # Find all active configs
                result = await db.execute(select(TradingConfig).filter(TradingConfig.is_active == True))
                active_configs = result.scalars().all()
                
                for config in active_configs:
                    wallet_result = await db.execute(select(WalletAccount).filter(WalletAccount.user_id == config.user_id))
                    wallet = wallet_result.scalars().first()
                    
                    if wallet and wallet.balance > 100:
                        # Simulate an algorithmic trade result
                        profit_chance = 0.55 # 55% win rate default
                        
                        if config.trading_type.value == "scalping":
                            profit_chance = 0.65
                        elif config.trading_type.value == "volatility":
                            profit_chance = 0.50
                            
                        is_profit = random.random() < profit_chance
                        
                        # Amount won or lost based on random bounds
                        trade_amount = Decimal(str(round(random.uniform(50, 1500), 2)))
                        
                        if is_profit:
                            wallet.balance += trade_amount
                            tx_type = TransactionType.TRADE_PROFIT
                            desc = f"AI Trade Profit ({config.trading_type.value})"
                        else:
                            wallet.balance -= trade_amount
                            tx_type = TransactionType.TRADE_LOSS
                            desc = f"AI Trade Loss ({config.trading_type.value})"
                            
                        # Insert transaction
                        new_tx = WalletTransaction(
                            wallet_id=wallet.id,
                            amount=trade_amount,
                            transaction_type=tx_type,
                            description=desc
                        )
                        db.add(new_tx)
                
                if active_configs:
                    await db.commit()
    except asyncio.CancelledError:
        print("[AlphaMind] Algorithmic Trading Engine shutting down...")
