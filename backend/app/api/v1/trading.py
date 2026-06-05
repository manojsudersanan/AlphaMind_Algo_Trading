from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from decimal import Decimal

from app.api.dependencies import get_db, get_current_user
from app.schemas.trading import TradingConfigCreate, TradingConfigUpdate, TradingConfigResponse, TradeMemoryResponse, TradingSessionResponse
from app.models.user import User
from app.models.trading_config import TradingConfig

router = APIRouter()

@router.get("/config", response_model=TradingConfigResponse)
async def get_trading_config(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get the current user's trading configuration settings."""
    from sqlalchemy.future import select
    
    result = await db.execute(select(TradingConfig).filter(TradingConfig.user_id == current_user.id))
    config = result.scalars().first()
    
    if not config:
        # Generate default config
        from app.models.trading_config import TradingType
        config = TradingConfig(
            user_id=current_user.id,
            trading_type=TradingType.INTRADAY,
            target_return_rate=Decimal('15.0'),
            is_active=False,
            fallback_to_previous_day=True,
            turboquant_enabled=True,
        )
        db.add(config)
        await db.commit()
        await db.refresh(config)
    
    return config

@router.put("/config", response_model=TradingConfigResponse)
async def update_trading_config(
    config_in: TradingConfigUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Update trading configuration settings."""
    from sqlalchemy.future import select
    
    result = await db.execute(select(TradingConfig).filter(TradingConfig.user_id == current_user.id))
    config = result.scalars().first()
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
        
    for field, value in config_in.model_dump(exclude_unset=True).items():
        setattr(config, field, value)
        
    await db.commit()
    await db.refresh(config)
    return config

@router.post("/start")
async def start_trading_engine(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Activates the AI algorithmic engine for the user."""
    from sqlalchemy.future import select
    from datetime import datetime
    result = await db.execute(select(TradingConfig).filter(TradingConfig.user_id == current_user.id))
    config = result.scalars().first()
    
    if not config:
        raise HTTPException(status_code=400, detail="Configuration missing")
        
    config.is_active = True
    
    # Also log this as a new trading session
    from app.models.trading_session import TradingSession
    from app.models.wallet import WalletAccount
    from sqlalchemy import update
    
    # Fetch current balance
    wallet_res = await db.execute(select(WalletAccount).filter(WalletAccount.user_id == current_user.id))
    wallet = wallet_res.scalars().first()
    start_bal = wallet.balance if wallet else Decimal("0.0")
    
    # Stop any currently active sessions first to avoid duplicates
    await db.execute(
        update(TradingSession)
        .filter(TradingSession.user_id == current_user.id, TradingSession.status == "active")
        .values(status="completed", end_time=datetime.utcnow(), end_balance=start_bal)
    )
    
    # Create new session
    new_session = TradingSession(
        user_id=current_user.id,
        strategy_type=config.trading_type.value if hasattr(config.trading_type, "value") else str(config.trading_type),
        target_return=float(config.target_return_rate),
        start_time=datetime.utcnow(),
        start_balance=start_bal,
        status="active"
    )
    db.add(new_session)
    await db.commit()
    
    return {"status": "started", "message": "AlphaMind Algorithm Engaged."}

@router.post("/stop")
async def stop_trading_engine(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Deactivates the AI algorithmic engine for the user."""
    from sqlalchemy.future import select
    from sqlalchemy import update
    from datetime import datetime
    result = await db.execute(select(TradingConfig).filter(TradingConfig.user_id == current_user.id))
    config = result.scalars().first()
    
    if config:
        config.is_active = False
        
        # Complete the active session
        from app.models.trading_session import TradingSession
        from app.models.wallet import WalletAccount
        
        wallet_res = await db.execute(select(WalletAccount).filter(WalletAccount.user_id == current_user.id))
        wallet = wallet_res.scalars().first()
        end_bal = wallet.balance if wallet else Decimal("0.0")
        
        await db.execute(
            update(TradingSession)
            .filter(TradingSession.user_id == current_user.id, TradingSession.status == "active")
            .values(status="completed", end_time=datetime.utcnow(), end_balance=end_bal)
        )
        await db.commit()
        
    return {"status": "stopped", "message": "AlphaMind Algorithm Disengaged."}

from app.services.edge_compute import edge_node

@router.get("/edge/status")
async def get_edge_status():
    """Get the status of the Edge Computation Node."""
    return edge_node.get_status()

@router.post("/edge/toggle")
async def toggle_edge_connection(online: bool):
    """Toggle online/offline status of the Edge Node."""
    edge_node.set_online_status(online)
    return {"status": "success", "edge_state": edge_node.get_status()}

@router.get("/memory", response_model=List[TradeMemoryResponse])
async def get_trading_memory(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get the latest adapted trade memory metrics."""
    from sqlalchemy.future import select
    from app.models.trade_memory import TradeMemory
    
    result = await db.execute(
        select(TradeMemory)
        .filter(TradeMemory.user_id == current_user.id)
        .order_by(TradeMemory.created_at.desc())
        .limit(10)
    )
    memories = result.scalars().all()
    return memories

@router.get("/sessions", response_model=List[TradingSessionResponse])
async def get_trading_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get the user's trading deployment sessions."""
    from sqlalchemy.future import select
    from app.models.trading_session import TradingSession
    
    result = await db.execute(
        select(TradingSession)
        .filter(TradingSession.user_id == current_user.id)
        .order_by(TradingSession.start_time.desc())
        .limit(20)
    )
    sessions = result.scalars().all()
    return sessions
