import enum
from decimal import Decimal
import uuid

from sqlalchemy import Numeric, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDMixin

class TradingType(str, enum.Enum):
    INTRADAY = "intraday"
    FNO = "fno"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"
    SCALPING = "scalping"
    VOLATILITY = "volatility"

class StopLossType(str, enum.Enum):
    FIXED = "fixed"
    ATR = "atr"
    TRAILING = "trailing"

class PositionSizingType(str, enum.Enum):
    FIXED = "fixed"
    KELLY = "kelly"
    AI_MANAGED = "ai_managed"

class TradingConfig(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "trading_configs"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    
    trading_type: Mapped[TradingType] = mapped_column(SQLEnum(TradingType), default=TradingType.INTRADAY)
    target_return_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal('10.0'))
    
    max_daily_loss_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal('2.0'))
    max_drawdown_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal('10.0'))
    max_position_size_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal('5.0'))
    max_open_positions: Mapped[int] = mapped_column(default=10)
    
    stop_loss_type: Mapped[StopLossType] = mapped_column(SQLEnum(StopLossType), default=StopLossType.ATR)
    position_sizing_type: Mapped[PositionSizingType] = mapped_column(SQLEnum(PositionSizingType), default=PositionSizingType.AI_MANAGED)
    
    auto_reinvestment: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    fallback_to_previous_day: Mapped[bool] = mapped_column(Boolean, default=True)
    turboquant_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    token_limiter_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    token_limit_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal('10.00'))

    
    # Relationships
    user = relationship("User", back_populates="trading_config")

    def __repr__(self) -> str:
        return f"<TradingConfig(user_id={self.user_id}, type={self.trading_type})>"
