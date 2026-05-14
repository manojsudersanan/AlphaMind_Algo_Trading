import enum
from decimal import Decimal
import uuid

from sqlalchemy import Enum as SQLEnum, Numeric, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDMixin

class TransactionType(str, enum.Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    FEE = "fee"
    TRADE_PROFIT = "trade_profit"
    TRADE_LOSS = "trade_loss"

class WalletAccount(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "wallet_accounts"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal('0.00'))
    trading_capital: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal('0.00'))
    reserve_balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal('0.00'))
    reinvestment_ratio: Mapped[Decimal] = mapped_column(Numeric(5, 4), default=Decimal('0.7000'))

    # Relationships
    user = relationship("User", back_populates="wallet")
    transactions = relationship("WalletTransaction", back_populates="wallet", cascade="all, delete-orphan")

    @property
    def withdrawable_balance(self) -> Decimal:
        return self.balance - self.trading_capital - self.reserve_balance

    @property
    def total_balance(self) -> Decimal:
        return self.balance

    def __repr__(self) -> str:
        return f"<WalletAccount(user_id={self.user_id}, balance={self.balance})>"

class WalletTransaction(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "wallet_transactions"

    wallet_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("wallet_accounts.id", ondelete="CASCADE"), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    transaction_type: Mapped[TransactionType] = mapped_column(SQLEnum(TransactionType), index=True)
    description: Mapped[str] = mapped_column(String(255), nullable=True)

    # Relationships
    wallet = relationship("WalletAccount", back_populates="transactions")

    @property
    def type(self) -> str:
        return self.transaction_type.value if hasattr(self.transaction_type, "value") else str(self.transaction_type)

    @property
    def status(self) -> str:
        return "completed"

    def __repr__(self) -> str:
        return f"<WalletTransaction(id={self.id}, amount={self.amount}, type={self.transaction_type})>"
