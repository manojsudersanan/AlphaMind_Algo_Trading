import uuid
from sqlalchemy import ForeignKey, Float, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin, UUIDMixin

class TradeMemory(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "trade_memory"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    win_rate: Mapped[float] = mapped_column(Float, default=0.0)
    net_pnl: Mapped[float] = mapped_column(Float, default=0.0)
    avg_profit: Mapped[float] = mapped_column(Float, default=0.0)
    avg_loss: Mapped[float] = mapped_column(Float, default=0.0)
    adapted_multiplier: Mapped[float] = mapped_column(Float, default=1.0)
    status_summary: Mapped[str] = mapped_column(String(500), default="Initialized")

    # Relationships
    user = relationship("User", back_populates="trade_memories")

    def __repr__(self) -> str:
        return f"<TradeMemory(user_id={self.user_id}, win_rate={self.win_rate})>"
