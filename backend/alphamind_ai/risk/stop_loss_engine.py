class StopLossEngine:
    """
    Continually processes open SQLite positions against current market OHLCV.
    Executes a forced liquidation pipeline if the Average True Range (ATR) dynamic boundary is breached.
    """
    def __init__(self, atr_multiplier: float = 2.0):
        self.atr_multiplier = atr_multiplier
        
    def check_liquidation_condition(self, entry_price: float, current_price: float, current_atr: float, is_long: bool) -> bool:
        """
        Calculates if the absolute stop loss logic overrides the Neural Network's "HOLD" command.
        Native equivalent constraints for high frequency validation.
        """
        # Calculate dynamic risk boundary based on ATR
        risk_buffer = current_atr * self.atr_multiplier
        
        if is_long:
            stop_price = entry_price - risk_buffer
            if current_price <= stop_price:
                return True
        else: # Short Positions
            stop_price = entry_price + risk_buffer
            if current_price >= stop_price:
                return True
                
        return False
