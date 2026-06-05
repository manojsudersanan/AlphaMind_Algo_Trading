from datetime import datetime
from pydantic import BaseModel, condecimal
from decimal import Decimal
from uuid import UUID

class WalletBase(BaseModel):
    is_active: bool = True

class WalletCreate(WalletBase):
    user_id: UUID

class WalletResponse(WalletBase):
    id: UUID
    user_id: UUID
    balance: Decimal
    trading_capital: Decimal
    reserve_balance: Decimal
    withdrawable_balance: Decimal
    total_balance: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    amount: Decimal
    type: str # 'deposit', 'withdrawal', 'profit_realized', 'loss_realized'
    status: str = "completed"
    reference_id: str | None = None
    description: str | None = None

class TransactionResponse(TransactionCreate):
    id: UUID
    wallet_id: UUID
    created_at: datetime
    running_pnl: Decimal | None = None

    class Config:
        from_attributes = True
