import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.api.v1.router import api_router
from app.api.websockets import price_feed
from app.tasks.market_data_task import live_market_feed_simulator
from app.tasks.trading_task import algorithmic_trading_loop
from app.api.dependencies import engine
from app.models.base import Base
import app.models # load all mappings

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize the background Task Queues (simulating Celery/Redis)
    print(f"[{settings.APP_NAME}] Starting Native Engine background processors...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Native SQLite Base Tables successfully mapped!")
    market_task = asyncio.create_task(live_market_feed_simulator())
    algo_task = asyncio.create_task(algorithmic_trading_loop())
    yield
    # Shutdown: Gracefully stop all background native threads
    print(f"[{settings.APP_NAME}] Stopping background processors...")
    market_task.cancel()
    algo_task.cancel()
    try:
        await market_task
        await algo_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title=f"{settings.APP_NAME} Internal API",
    version=settings.APP_VERSION,
    description="Native AlphaMind Algorithmic Trading AI",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration allowing Next.js Native Server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL, 
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.exception_handler(Exception)
# async def generic_exception_handler(request: Request, exc: Exception):
#     print(f"Server Error: {str(exc)}")
#     return JSONResponse(status_code=500, content={"message": "Internal Server Error"})

@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "environment": settings.APP_ENV,
        "mode": "NATIVE",
        "hft_enabled": False
    }

app.include_router(api_router, prefix="/api/v1")
app.include_router(price_feed.router)
