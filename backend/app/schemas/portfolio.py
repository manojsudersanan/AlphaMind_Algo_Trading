from pydantic import BaseModel, ConfigDict
from decimal import Decimal
import uuid

class PositionResponse(BaseModel):
    id: uuid.UUID
    symbol: str
    quantity: Decimal
    average_entry_price: Decimal
    current_price: Decimal | None = None
    unrealized_pnl: Decimal | None = None
    
    model_config = ConfigDict(from_attributes=True)

class PortfolioResponse(BaseModel):
    id: uuid.UUID
    total_value: Decimal
    cash_balance: Decimal
    invested_amount: Decimal
    realized_pnl: Decimal
    unrealized_pnl: Decimal
    daily_pnl: Decimal | None = None
    positions: list[PositionResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class PerformanceMetrics(BaseModel):
    sharpe_ratio: float | None = None
    sortino_ratio: float | None = None
    max_drawdown: float | None = None
    win_rate: float | None = None
    profit_factor: float | None = None
