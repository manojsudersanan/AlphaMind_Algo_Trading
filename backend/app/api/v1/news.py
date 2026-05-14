from fastapi import APIRouter
from app.services.news_intelligence import get_market_intelligence

router = APIRouter()

@router.get("/intelligence")
async def market_intelligence():
    """Fetch live market news, compute sentiment, and return short/long-term effects."""
    data = await get_market_intelligence()
    return data
