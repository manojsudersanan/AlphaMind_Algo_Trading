import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

class MarketDataFetcher:
    """
    Retrieves historical and live OHLCV data to train the AlphaMind Engine.
    For Native execution without an external broker, this relies on yfinance.
    """
    def __init__(self, symbols: list[str] = None):
        if symbols is None:
            self.symbols = ["^NSEI", "^NSEBANK", "RELIANCE.NS", "HDFCBANK.NS"] # Default NIFTY 50 proxies
        else:
            self.symbols = symbols

    def fetch_historical(self, days: int = 365, interval: str = "1d") -> pd.DataFrame:
        """
        Downloads historical dataset for local agent reinforcement learning.
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        print(f"[DataFetcher] Connecting to Yahoo Finance for {len(self.symbols)} assets...")
        df = yf.download(
            tickers=self.symbols,
            start=start_date.strftime('%Y-%m-%d'),
            end=end_date.strftime('%Y-%m-%d'),
            interval=interval,
            group_by='ticker',
            auto_adjust=True,
            threads=True
        )
        
        # Flattening multiindex or standardizing to AlphaMind format
        if len(self.symbols) > 1:
             # Stack tickers into a unified dataset structure 
             df = df.stack(level=0, future_stack=True).reset_index()
             df.rename(columns={'level_1': 'ticker'}, inplace=True)
        else:
             df['ticker'] = self.symbols[0]
             df.reset_index(inplace=True)
             
        # Clean nulls from non-trading days
        df.dropna(inplace=True)
        return df

    async def fetch_live_quote(self, symbol: str) -> dict:
        """
        Fetches the current live quote for the symbol synchronously offloaded to a thread map.
        """
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="1d")
        if data.empty:
            return {}
            
        last_quote = data.iloc[-1]
        return {
            "symbol": symbol,
            "price": last_quote['Close'],
            "volume": last_quote['Volume'],
            "timestamp": data.index[-1].isoformat()
        }
