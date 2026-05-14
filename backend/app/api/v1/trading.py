from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from decimal import Decimal

from app.api.dependencies import get_db, get_current_user
from app.schemas.trading import TradingConfigCreate, TradingConfigUpdate, TradingConfigResponse
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
    result = await db.execute(select(TradingConfig).filter(TradingConfig.user_id == current_user.id))
    config = result.scalars().first()
    
    if not config:
        raise HTTPException(status_code=400, detail="Configuration missing")
        
    config.is_active = True
    await db.commit()
    
    # In a full Native rollout, we would trigger an Event or FastAPI BackgroundTask here 
    # to begin the Market Intelligence Scanner loop for this specific user.
    return {"status": "started", "message": "AlphaMind Algorithm Engaged."}

@router.post("/stop")
async def stop_trading_engine(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Deactivates the AI algorithmic engine for the user."""
    from sqlalchemy.future import select
    result = await db.execute(select(TradingConfig).filter(TradingConfig.user_id == current_user.id))
    config = result.scalars().first()
    
    if config:
        config.is_active = False
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
