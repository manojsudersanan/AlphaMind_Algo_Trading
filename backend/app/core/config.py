import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "AlphaMind"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///../alphamind_native.db"
    
    # JWT
    JWT_SECRET_KEY: str = "CHANGE_THIS_TO_A_RANDOM_64_CHAR_STRING"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Risk Parameters
    MAX_DAILY_LOSS_PCT: float = 2.0
    MAX_DRAWDOWN_PCT: float = 10.0
    MAX_POSITION_SIZE_PCT: float = 5.0
    DEFAULT_REINVESTMENT_RATIO: float = 0.70
    
    # Feature Flags
    ENABLE_PAPER_TRADING: bool = True
    ENABLE_AUTO_REINVESTMENT: bool = True
    ENABLE_LIVE_TRADING: bool = False
    
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()
