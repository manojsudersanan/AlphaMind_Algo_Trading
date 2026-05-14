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
        
        # Volume & Micro-structure
        df.ta.obv(append=True)
        df.ta.vwap(append=True)
        
        # Advanced SOTA Factors
        # Ichimoku Cloud (Provides support/resistance momentum regimes)
        # Using standard parameters: tenkan=9, kijun=26, senkou=52
        df.ta.ichimoku(append=True)
        
        # Cross-Sectional & Volatility normalized metrics
        df['ATR_Normalized'] = df['ATRr_14'] / df['Close']
        df['Daily_Return'] = df['Close'].pct_change()
        
        # State Space normalization preparation (Fill NA due to rolling windows)
        df.bfill(inplace=True)
        
        # Drop strictly non-numeric columns for RL State Space
        df = df.select_dtypes(include=['float64', 'int64', 'float32', 'int32'])
        
        return df
