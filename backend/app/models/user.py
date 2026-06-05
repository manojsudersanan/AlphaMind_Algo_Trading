from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDMixin

class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # 2FA Support
    is_2fa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    totp_secret: Mapped[str] = mapped_column(String(255), nullable=True)

    # Relationships
    wallet = relationship("WalletAccount", back_populates="user", uselist=False, cascade="all, delete-orphan")
    trading_config = relationship("TradingConfig", back_populates="user", uselist=False, cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    positions = relationship("Position", back_populates="user", cascade="all, delete-orphan")
    trades = relationship("Trade", back_populates="user", cascade="all, delete-orphan")
    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")
    paper_trades = relationship("PaperTrade", back_populates="user", cascade="all, delete-orphan")
    trade_memories = relationship("TradeMemory", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User(email={self.email}, id={self.id})>"
