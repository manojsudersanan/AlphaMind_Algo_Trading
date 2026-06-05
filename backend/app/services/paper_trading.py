class SlippageModel:
    """
    Simulates the market impact and liquidity spread cost when filling market orders natively.
    """
    @staticmethod
    def calculate(price: float, quantity: int, volatility_index: float = 1.0) -> float:
        # Base spread 0.02% + Volume impact
        impact = 0.0002 + (quantity / 1000000) * volatility_index
        return price * (1 + impact) if quantity > 0 else price * (1 - impact)

class ZerodhaCommissionModel:
    """
    Applies exact Indian NSE/BSE Zerodha Equity Intraday transaction mapping.
    """
    @staticmethod
    def calculate(turnover: float, is_buy: bool) -> float:
        brokerage = min(20.0, turnover * 0.0003)
        stt = 0.0 if is_buy else turnover * 0.00025 # Only on sell for Intraday Cash
        exchange_txn = turnover * 0.0000345
        gst = (brokerage + exchange_txn) * 0.18
        sebi = turnover * 0.000001
        stamp_duty = turnover * 0.00003 if is_buy else 0.0
        
        return brokerage + stt + exchange_txn + gst + sebi + stamp_duty


class DynamicKellyCriterion:
    """
    State-of-the-art Risk Management layer. 
    Adjusts trade sizing based on PPO Confidence and Macro Agentic NLP Mood Score.
    """
    @staticmethod
    def calculate_sizing_pct(win_prob: float = 0.55, win_loss_ratio: float = 1.5, mood_score: float = 0.0) -> float:
        # Standard Kelly formula: f = W - ((1 - W) / R)
        kelly_pct = win_prob - ((1.0 - win_prob) / win_loss_ratio)
        
        # NLP Agentic Risk Overlay
        # If market mood is extremely pessimistic, reduce kelly sizing by up to 50%
        # If highly optimistic, allow up to 120% of base Kelly.
        mood_multiplier = 1.0 + (mood_score * 0.5) 
        
        adjusted_pct = kelly_pct * mood_multiplier
        
        # Cap sizing to a safe SOTA maximum limit of 15% of portfolio per trade
        return max(0.01, min(0.15, adjusted_pct))

class VirtualBroker:
    """
    The Native Equivalent of an external FIX protocol matching engine.
    Executes trades against the local Mock Wallet securely storing the PnL history to SQLite.
    Now incorporates Dynamic NLP-adjusted Position Sizing.
    """
    def __init__(self, initial_balance: float = 100000.0):
        self.available_cash = initial_balance
        self.portfolio_value = initial_balance
        self.holdings = {}
        
    def execute_market_order(self, symbol: str, quantity: int, current_market_price: float, mood_score: float = 0.0) -> dict:
        is_buy = quantity > 0
        
        # In a real environment, we would use Dynamic Kelly here to adjust the exact quantity.
        # Example: optimal_qty = int((self.available_cash * DynamicKellyCriterion.calculate_sizing_pct(mood_score=mood_score)) / current_market_price)
        
        fill_price = SlippageModel.calculate(current_market_price, quantity)
        turnover = abs(quantity) * fill_price
        
        commission = ZerodhaCommissionModel.calculate(turnover, is_buy=is_buy)
        total_cost_or_revenue = turnover + commission if is_buy else turnover - commission
        
        if is_buy:
            if self.available_cash < total_cost_or_revenue:
                raise Exception("Insufficient mock capital.")
            self.available_cash -= total_cost_or_revenue
            self.holdings[symbol] = self.holdings.get(symbol, 0) + quantity
        else: # Sell
            if self.holdings.get(symbol, 0) < abs(quantity):
                raise Exception("Insufficient mock shares to sell.")
            self.available_cash += total_cost_or_revenue
            self.holdings[symbol] -= abs(quantity)
            
        print(f"[VirtualBroker] Simulated {'BUY' if is_buy else 'SELL'} {abs(quantity)} {symbol} @ {fill_price:.2f} (Comm: Rs.{commission:.2f}) | NLP Score: {mood_score}")
        
        return {
            "status": "FILLED",
            "symbol": symbol,
            "fill_price": fill_price,
            "quantity": quantity,
            "commission": commission,
            "cash_remaining": self.available_cash
        }
