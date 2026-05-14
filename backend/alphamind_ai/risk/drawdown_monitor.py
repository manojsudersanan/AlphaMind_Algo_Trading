from app.core.config import settings

class DrawdownMonitor:
    """
    Evaluates the user's Total Portfolio Equity in real-time.
    If the drawdown from the High Water Mark exceeds the globally configured limit, 
    all trading agents are immediately halted natively to protect remaining capital.
    """
    def __init__(self, initial_equity: float):
        self.high_water_mark = initial_equity
        self.max_drawdown_pct = settings.MAX_DRAWDOWN_PCT / 100.0
        
    def check_circuit_breaker(self, current_equity: float) -> bool:
        """
        Returns True if the portfolio has breached the Maximum Allowable Drawdown.
        """
        # Update high water mark if equity has reached a new maximum
        if current_equity > self.high_water_mark:
            self.high_water_mark = current_equity
            
        current_drawdown = (self.high_water_mark - current_equity) / self.high_water_mark
        
        if current_drawdown >= self.max_drawdown_pct:
            print(f"[CIRCUIT BREAKER] MAX DRAWDOWN BREACHED: {current_drawdown*100:.1f}%. HALTING ENGINE.")
            return True
            
        return False
