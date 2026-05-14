from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from .base import BaseRepository
from ..models.order import Order, OrderStatus

class OrderRepository(BaseRepository[Order]):
    def __init__(self):
        super().__init__(Order)

    async def get_open_orders(self, db: AsyncSession, user_id: uuid.UUID):
        result = await db.execute(
            select(Order)
            .where(Order.user_id == user_id, Order.status.in_([OrderStatus.PENDING, OrderStatus.PARTIAL]))
        )
        return result.scalars().all()

    async def get_by_broker_id(self, db: AsyncSession, broker_id: str) -> Order | None:
        result = await db.execute(select(Order).where(Order.broker_order_id == broker_id))
        return result.scalars().first()
