from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import uuid
from .base import BaseRepository
from ..models.signal import AISignal, SignalType

class SignalRepository(BaseRepository[AISignal]):
    def __init__(self):
        super().__init__(AISignal)

    async def get_latest_signal(self, db: AsyncSession, symbol: str) -> AISignal | None:
        result = await db.execute(
            select(AISignal)
            .where(AISignal.symbol == symbol)
            .order_by(AISignal.created_at.desc())
            .limit(1)
        )
        return result.scalars().first()

    async def get_signals_by_symbol(self, db: AsyncSession, symbol: str, limit: int = 50):
        result = await db.execute(
            select(AISignal)
            .where(AISignal.symbol == symbol)
            .order_by(AISignal.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()

    async def mark_acted_on(self, db: AsyncSession, signal_id: uuid.UUID) -> bool:
        signal = await self.get_by_id(db, signal_id)
        if signal:
            signal.acted_upon = True
            await db.commit()
            return True
        return False
