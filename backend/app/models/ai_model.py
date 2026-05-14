from sqlalchemy import String, JSON, Float
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin, UUIDMixin

class AIModel(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ai_models"

    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    version: Mapped[str] = mapped_column(String(50))
    model_type: Mapped[str] = mapped_column(String(50)) # e.g., 'rl', 'forecasting'
    s3_path: Mapped[str] = mapped_column(String(500), nullable=True)
    
    # Performance metrics
    accuracy: Mapped[float] = mapped_column(Float, nullable=True)
    f1_score: Mapped[float] = mapped_column(Float, nullable=True)
    sharpe_ratio: Mapped[float] = mapped_column(Float, nullable=True)
    max_drawdown: Mapped[float] = mapped_column(Float, nullable=True)

    hyperparameters: Mapped[dict] = mapped_column(JSON, default={})
    is_active: Mapped[bool] = mapped_column(default=False)

    def __repr__(self) -> str:
        return f"<AIModel(name={self.name}, version={self.version})>"
