from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import uuid
from .base import BaseRepository
from ..models.user import User

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalars().first()
