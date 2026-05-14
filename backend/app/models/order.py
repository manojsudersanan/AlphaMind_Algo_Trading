import enum
from decimal import Decimal
import uuid

from sqlalchemy import Enum as SQLEnum, Numeric, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDMixin

class OrderType(str, enum.Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"

class OrderSide(str, enum.Enum):
    BUY = "buy"
    SELL = "sell"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    FILLED = "filled"
    PARTIAL = "partial"
    CANCELED = "canceled"
    REJECTED = "rejected"

class Order(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "orders"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    broker_order_id: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=True)
    symbol: Mapped[str] = mapped_column(String(50), index=True)
    
    order_type: Mapped[OrderType] = mapped_column(SQLEnum(OrderType))
    side: Mapped[OrderSide] = mapped_column(SQLEnum(OrderSide))
    status: Mapped[OrderStatus] = mapped_column(SQLEnum(OrderStatus), default=OrderStatus.PENDING, index=True)
    
    quantity: Mapped[Decimal] = mapped_column(Numeric(15, 6), nullable=False)
    filled_quantity: Mapped[Decimal] = mapped_column(Numeric(15, 6), default=Decimal('0.0'))
    
    price: Mapped[Decimal] = mapped_column(Numeric(18, 6), nullable=True)
    stop_price: Mapped[Decimal] = mapped_column(Numeric(18, 6), nullable=True)
    average_fill_price: Mapped[Decimal] = mapped_column(Numeric(18, 6), nullable=True)

    # Relationships
    user = relationship("User", back_populates="orders")

    def __repr__(self) -> str:
        return f"<Order(id={self.id}, symbol={self.symbol}, status={self.status})>"
