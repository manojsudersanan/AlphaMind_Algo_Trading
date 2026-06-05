import uuid
from datetime import datetime
from sqlalchemy import ForeignKey, DateTime, Float, String, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from decimal import Decimal

from .base import Base, TimestampMixin, UUIDMixin

class TradingSession(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "trading_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    strategy_type: Mapped[str] = mapped_column(String(50))
    target_return: Mapped[float] = mapped_column(Float)
    start_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    end_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    start_balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal('0.00'))
    end_balance: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active") # "active", "completed"

    # Relationships
    user = relationship("User", back_populates="trading_sessions")
