from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, text
from decimal import Decimal
import uuid
from .base import BaseRepository
from ..models.wallet import WalletAccount, WalletTransaction, TransactionType

class WalletRepository(BaseRepository[WalletAccount]):
    def __init__(self):
        super().__init__(WalletAccount)

    async def get_by_user_id(self, db: AsyncSession, user_id: uuid.UUID) -> WalletAccount | None:
        result = await db.execute(select(WalletAccount).where(WalletAccount.user_id == user_id))
        return result.scalars().first()

    async def get_balance(self, db: AsyncSession, user_id: uuid.UUID) -> Decimal:
        wallet = await self.get_by_user_id(db, user_id)
        return wallet.balance if wallet else Decimal("0.0")

    async def add_transaction(self, db: AsyncSession, wallet_id: uuid.UUID, amount: Decimal, tx_type: TransactionType, desc: str = "") -> WalletTransaction:
        tx = WalletTransaction(wallet_id=wallet_id, amount=amount, transaction_type=tx_type, description=desc)
        db.add(tx)
        await db.commit()
        await db.refresh(tx)
        return tx

    async def update_balance_atomic(self, db: AsyncSession, wallet_id: uuid.UUID, amount_delta: Decimal) -> WalletAccount | None:
        # Update without FOR UPDATE to prevent SQLite locking errors
        result = await db.execute(select(WalletAccount).where(WalletAccount.id == wallet_id))
        wallet = result.scalars().first()
        if wallet:
            wallet.balance += amount_delta
            await db.commit()
            await db.refresh(wallet)
        return wallet

    async def get_transactions(self, db: AsyncSession, wallet_id: uuid.UUID, limit: int = 100) -> list[WalletTransaction]:
        result = await db.execute(
            select(WalletTransaction)
            .where(WalletTransaction.wallet_id == wallet_id)
            .order_by(WalletTransaction.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
