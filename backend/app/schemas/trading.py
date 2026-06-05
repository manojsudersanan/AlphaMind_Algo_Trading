from datetime import datetime
from pydantic import BaseModel
from decimal import Decimal
from uuid import UUID

class TradingConfigBase(BaseModel):
    trading_type: str = "intraday"
    target_return_rate: Decimal = Decimal("10.0")
    is_active: bool = False
    fallback_to_previous_day: bool = True
    turboquant_enabled: bool = True
    token_limiter_enabled: bool = False
    token_limit_amount: Decimal = Decimal("10.00")

class TradingConfigCreate(TradingConfigBase):
    pass

class TradingConfigUpdate(BaseModel):
    trading_type: str | None = None
    target_return_rate: float | None = None
    is_active: bool | None = None
    fallback_to_previous_day: bool | None = None
    turboquant_enabled: bool | None = None
    token_limiter_enabled: bool | None = None
    token_limit_amount: float | None = None

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
    fallback_to_previous_day: bool
    turboquant_enabled: bool
    token_limiter_enabled: bool
    token_limit_amount: Decimal
    created_at: datetime
    updated_at: datetime


    class Config:
        from_attributes = True

class TradeMemoryResponse(BaseModel):
    id: UUID
    user_id: UUID
    win_rate: float
    net_pnl: float
    avg_profit: float
    avg_loss: float
    adapted_multiplier: float
    status_summary: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TradingSessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    strategy_type: str
    target_return: float
    start_time: datetime
    end_time: datetime | None
    start_balance: Decimal
    end_balance: Decimal | None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

