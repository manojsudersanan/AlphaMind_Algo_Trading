from pydantic import BaseModel, ConfigDict
from decimal import Decimal
import uuid
from datetime import datetime
from ..models.signal import SignalType

class SignalResponse(BaseModel):
    id: uuid.UUID
    symbol: str
    signal_type: SignalType
    confidence: float
    model_version: str
    timeframe: str
    reasoning: str | None = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class OptimalSettingsResponse(BaseModel):
    trading_type: str
    suggested_return_rate: Decimal
    suggested_risk_limit: Decimal
    confidence_score: float

class ModelStatusResponse(BaseModel):
    active_model: str
    version: str
    last_trained: datetime
    training_status: str
    accuracy: float | None = None

class MarketOutlookResponse(BaseModel):
    outlook: str # Bullish, Bearish, Neutral
    summary: str
    key_drivers: list[str]
    generated_at: datetime
