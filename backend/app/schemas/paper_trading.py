from pydantic import BaseModel, ConfigDict
from decimal import Decimal
import uuid
from datetime import date

class SimulationRequest(BaseModel):
    trading_type: str
    capital: Decimal
    start_date: date
    end_date: date

class ForecastResponse(BaseModel):
    expected_pnl: Decimal
    win_rate: float
    max_drawdown: float
    trade_count_estimate: int

class SimulationResponse(BaseModel):
    id: uuid.UUID
    status: str
    final_capital: Decimal | None = None
    total_pnl: Decimal | None = None
    forecast: ForecastResponse | None = None
    
    model_config = ConfigDict(from_attributes=True)
