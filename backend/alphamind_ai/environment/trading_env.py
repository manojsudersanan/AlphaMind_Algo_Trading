import gymnasium as gym
from gymnasium import spaces
import numpy as np
import pandas as pd

class AlphaMindTradingEnv(gym.Env):
    """
    A unified Custom Trading Environment utilizing Gymnasium for rigorous RL training.
    """
    metadata = {'render.modes': ['human']}

    def __init__(self, df: pd.DataFrame, initial_balance=100000.0, fee_pct=0.001):
        super(AlphaMindTradingEnv, self).__init__()
        
        self.df = df
        self.initial_balance = initial_balance
        self.fee_pct = fee_pct
        
        # Action space: [0 = Sell, 1 = Hold, 2 = Buy]
        self.action_space = spaces.Discrete(3)
        
        # Observation space boundaries based on DataFrame columns
        # Exclude Date and Ticker from observations
        self.obs_columns = [c for c in df.columns if c not in ['Date', 'Ticker', 'timestamp']]
        num_features = len(self.obs_columns)
        
        # Using a loose boundary for un-normalized raw ML features
        self.observation_space = spaces.Box(
            low=-np.inf, high=np.inf, shape=(num_features,), dtype=np.float32
        )
        
        self.reset()

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        
        self.current_step = 0
        self.balance = self.initial_balance
        self.shares_held = 0
        self.total_equity = self.initial_balance
        self.max_equity = self.initial_balance
        
        return self._get_observation(), {}

    def _get_observation(self):
        obs = self.df[self.obs_columns].iloc[self.current_step].values
        # Replace NaNs or Infs that could disrupt the Neural Network
        obs = np.nan_to_num(obs)
        return obs.astype(np.float32)

    def step(self, action):
        current_price = self.df.iloc[self.current_step]['Close']
        reward = 0
        done = False
        
        # Execute Action
        if action == 2: # Buy
            if self.balance > current_price * (1 + self.fee_pct):
                shares_bought = self.balance // (current_price * (1 + self.fee_pct))
                cost = shares_bought * current_price * (1 + self.fee_pct)
                self.shares_held += shares_bought
                self.balance -= cost
                
        elif action == 0: # Sell
            if self.shares_held > 0:
                revenue = self.shares_held * current_price * (1 - self.fee_pct)
                self.balance += revenue
                self.shares_held = 0

        # Progress time step
        self.current_step += 1
        
        # Check termination condition
        if self.current_step >= len(self.df) - 1:
            done = True
            
        # Evaluation Metrics
        next_price = self.df.iloc[self.current_step]['Close'] if not done else current_price
        
        previous_equity = self.total_equity
        self.total_equity = self.balance + (self.shares_held * next_price)
        
        # Reward Calculation: Daily PnL difference
        reward = self.total_equity - previous_equity
        
        # Update High Water Mark for Drawdown checks
        if self.total_equity > self.max_equity:
            self.max_equity = self.total_equity

        info = {
            'step': self.current_step,
            'balance': self.balance,
            'shares': self.shares_held,
            'equity': self.total_equity,
            'action': action
        }
        
        return self._get_observation(), reward, done, False, info

    def render(self, mode='human'):
        print(f"Step: {self.current_step} | Equity: {self.total_equity:.2f} | Shares: {self.shares_held}")
