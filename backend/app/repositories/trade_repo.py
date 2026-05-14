from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime
import uuid
from .base import BaseRepository
from ..models.trade import Trade

class TradeRepository(BaseRepository[Trade]):
    def __init__(self):
        super().__init__(Trade)

    async def get_trades_by_period(self, db: AsyncSession, start_time: datetime, end_time: datetime):
        result = await db.execute(select(Trade).where(Trade.created_at >= start_time, Trade.created_at <= end_time))
        return result.scalars().all()

    async def get_open_trades(self, db: AsyncSession):
        result = await db.execute(select(Trade).where(Trade.exit_price == None))
        return result.scalars().all()

    async def calculate_pnl_summary(self, db: AsyncSession, user_id: uuid.UUID):
        result = await db.execute(
            select(func.sum(Trade.pnl))
            .where(Trade.user_id == user_id, Trade.pnl != None)
        )
        return result.scalar() or 0.0
