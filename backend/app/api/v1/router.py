from fastapi import APIRouter
from app.api.v1 import auth, wallet, trading, paper_trading, analytics, news

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(wallet.router, prefix="/wallet", tags=["wallet"])
api_router.include_router(trading.router, prefix="/trading", tags=["trading"])
api_router.include_router(paper_trading.router, prefix="/paper_trading", tags=["paper_trading"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(news.router, prefix="/news", tags=["news"])
