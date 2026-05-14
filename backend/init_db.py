import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.api.dependencies import engine
from app.models import *
from app.models.base import Base

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

print("Materializing SQLite Native Databases...")
asyncio.run(init_db())
print("Success!")
