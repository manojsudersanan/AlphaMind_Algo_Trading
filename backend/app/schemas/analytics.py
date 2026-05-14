from pydantic import BaseModel
from decimal import Decimal
from datetime import date

class DailyPnL(BaseModel):
    date: date
    pnl: Decimal
    cumulative_pnl: Decimal

class PnLResponse(BaseModel):
    history: list[DailyPnL]
    total_pnl: Decimal

class DrawdownData(BaseModel):
    date: date
    drawdown_pct: float

class DrawdownResponse(BaseModel):
    history: list[DrawdownData]
    max_drawdown: float

class ProjectionPoint(BaseModel):
    month: int
    expected_value: Decimal
    percentile_10: Decimal
    percentile_90: Decimal

class CompoundingProjectionResponse(BaseModel):
    projections: list[ProjectionPoint]
