from decimal import Decimal
import uuid

from sqlalchemy import Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDMixin

class Portfolio(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "portfolios"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    total_value: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    cash_balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    invested_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    realized_pnl: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False, default=Decimal("0.0"))
    unrealized_pnl: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False, default=Decimal("0.0"))
    daily_pnl: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=True)

    # Relationships
    user = relationship("User", back_populates="portfolios")

    def __repr__(self) -> str:
        return f"<Portfolio(user_id={self.user_id}, total_value={self.total_value})>"
