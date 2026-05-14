import enum
from sqlalchemy import Enum as SQLEnum, String, Float
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, UUIDMixin, TimestampMixin

class SignalType(str, enum.Enum):
    BUY = "buy"
    SELL = "sell"
    HOLD = "hold"

class AISignal(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ai_signals"

    # TimescaleDB hypertable uses created_at
    symbol: Mapped[str] = mapped_column(String(50), index=True)
    signal_type: Mapped[SignalType] = mapped_column(SQLEnum(SignalType))
    confidence: Mapped[float] = mapped_column(Float)
    model_version: Mapped[str] = mapped_column(String(50))
    timeframe: Mapped[str] = mapped_column(String(20)) # e.g. 1m, 5m, 1d
    
    # Optional context from LLMs or reasoning
    reasoning: Mapped[str] = mapped_column(String, nullable=True)
    acted_upon: Mapped[bool] = mapped_column(default=False)

    def __repr__(self) -> str:
        return f"<AISignal(symbol={self.symbol}, type={self.signal_type}, confidence={self.confidence})>"
