from app.core.config import settings

class PositionLimitsManager:
    """
    Validates algorithm trade signals against user-defined capital allocation rules.
    Prevents the Neural Network from over-leveraging or exceeding Maximum Concentration constraints.
    """
    def __init__(self, current_equity: float):
        self.equity = current_equity
        self.max_position_pct = settings.MAX_POSITION_SIZE_PCT / 100.0
        
    def validate_trade_size(self, intended_capital: float, current_asset_exposure: float) -> float:
        """
        Returns the legally permitted capital allocation for the impending native trade.
        Rejects or scales down trades exceeding risk bounds.
        """
        absolute_max = self.equity * self.max_position_pct
        
        # If already over-exposed, immediate rejection (0.0 capital allowed)
        if current_asset_exposure >= absolute_max:
            return 0.0
            
        allowable_remaining = absolute_max - current_asset_exposure
        
        # Scale trade down if it violates bounds, otherwise allow full intended size
        return min(intended_capital, allowable_remaining)
