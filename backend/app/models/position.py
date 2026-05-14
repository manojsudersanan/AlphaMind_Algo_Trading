from decimal import Decimal
import uuid

from sqlalchemy import Numeric, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDMixin

class Position(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "positions"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(50), index=True)
    
    quantity: Mapped[Decimal] = mapped_column(Numeric(15, 6), nullable=False)
    average_entry_price: Mapped[Decimal] = mapped_column(Numeric(18, 6), nullable=False)
    current_price: Mapped[Decimal] = mapped_column(Numeric(18, 6), nullable=True)
    unrealized_pnl: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=True)

    # Relationships
    user = relationship("User", back_populates="positions")

    def __repr__(self) -> str:
        return f"<Position(id={self.id}, symbol={self.symbol}, qty={self.quantity})>"
