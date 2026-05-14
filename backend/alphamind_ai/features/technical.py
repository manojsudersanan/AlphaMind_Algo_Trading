import pandas as pd
import pandas_ta as ta

class TechnicalFeatureEngine:
    """
    Applies rigorous quantitative technical analysis indicators seamlessly
    to the OHLCV dataframe, outputting a completely formatted Observation State Space
    ready for the RL Reinforcement Agent.
    """
    def __init__(self, data: pd.DataFrame):
        self.data = data.copy()
        
    def generate_features(self) -> pd.DataFrame:
        """
        Calculates Standard and Proprietary ML indicators.
        Must contain Open, High, Low, Close, Volume columns.
        """
        df = self.data.copy()
        
        # Ensure column standardizations
        df.columns = [c.capitalize() if c.lower() != 'ticker' else 'ticker' for c in df.columns]
        
        # Momentum
        df.ta.rsi(length=14, append=True)
        df.ta.macd(fast=12, slow=26, signal=9, append=True)
        
        # Volatility
        df.ta.bbands(length=20, std=2, append=True)
        df.ta.atr(length=14, append=True)
        
        # Trend
        df.ta.ema(length=9, append=True)
        df.ta.ema(length=21, append=True)
        df.ta.sma(length=50, append=True)
        df.ta.sma(length=200, append=True)
        
        # Volume
        df.ta.obv(append=True)
        df.ta.vwap(append=True)
        
        # Calculate Returns
        df['Daily_Return'] = df['Close'].pct_change()
        
        # State Space normalization preparation (Fill NA due to rolling windows)
        df.fillna(method='bfill', inplace=True)
        
        return df
