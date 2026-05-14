from datetime import datetime
from pydantic import BaseModel
from decimal import Decimal
from uuid import UUID

class TradingConfigBase(BaseModel):
    trading_type: str = "intraday"
    target_return_rate: Decimal = Decimal("10.0")
    is_active: bool = False

class TradingConfigCreate(TradingConfigBase):
    pass

class TradingConfigUpdate(BaseModel):
    trading_type: str | None = None
    target_return_rate: float | None = None
    is_active: bool | None = None

class TradingConfigResponse(BaseModel):
    id: UUID
    user_id: UUID
    trading_type: str
    target_return_rate: Decimal
    max_daily_loss_pct: Decimal
    max_drawdown_pct: Decimal
    max_position_size_pct: Decimal
    max_open_positions: int
    stop_loss_type: str
    position_sizing_type: str
    auto_reinvestment: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
