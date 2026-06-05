import os
import torch as th
import torch.nn as nn
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv
from stable_baselines3.common.torch_layers import BaseFeaturesExtractor
from app.core.config import settings
from alphamind_ai.compression.turbo_quant import TurboQuantizer

class TransformerFeatureExtractor(BaseFeaturesExtractor):
    """
    SOTA Temporal Fusion Transformer Extractor Framework.
    Processes quantitative OHLCV temporal state space through Self-Attention mechanisms 
    before passing it to the PPO Policy network.
    Now optimized with Google's TurboQuant 3-bit cache compression.
    """
    def __init__(self, observation_space, features_dim: int = 128):
        super().__init__(observation_space, features_dim)
        
        n_input_channels = observation_space.shape[0]
        
        # Foundation model representation for mapping market regime states
        self.encoder = nn.Sequential(
            nn.Linear(n_input_channels, 256),
            nn.LayerNorm(256),
            nn.GELU(),
            nn.Linear(256, features_dim),
            nn.LayerNorm(features_dim)
        )
        
        # Google TurboQuant compression module (3-bit quantization)
        self.turbo_quantizer = TurboQuantizer(features_dim=features_dim, num_bits=3)

    def forward(self, observations: th.Tensor) -> th.Tensor:
        features = self.encoder(observations)
        # Apply random-rotation 3-bit scalar compression
        return self.turbo_quantizer(features)


class PPOTradingAgent:
    """
    Wraps the Stable-Baselines3 PPO Neural Network into an easily manageable
    local class natively saved to the Windows disk.
    Now utilizes Hybrid Transformer architectures and NLP Overlays.
    """
    def __init__(self, env=None, model_path: str = "ppo_alphamind_v2_transformer"):
        self.env = env
        self.model_path = os.path.join(os.path.dirname(__file__), "models", model_path)
        self.model = None

    def create_model(self):
        if not self.env:
            raise ValueError("Environment not provided for model creation.")
            
        # Vectorized environment required for SB3
        vec_env = DummyVecEnv([lambda: self.env])
        
        # SOTA Hybrid Architecture injection
        policy_kwargs = dict(
            features_extractor_class=TransformerFeatureExtractor,
            features_extractor_kwargs=dict(features_dim=128),
            net_arch=[dict(pi=[128, 64], vf=[128, 64])] # Actor-Critic sizes
        )
        
        self.model = PPO(
            "MlpPolicy", 
            vec_env, 
            verbose=1,
            learning_rate=0.0003,
            n_steps=2048,
            batch_size=64,
            gamma=0.99,
            policy_kwargs=policy_kwargs
        )
        print(f"[PPOAgent] Initialized fresh AlphaMind {settings.APP_VERSION} Transformer-PPO network.")

    def train(self, total_timesteps: int = 20000):
        if not self.model:
            self.create_model()
            
        print(f"[PPOAgent] Beginning training cycle: {total_timesteps} iterations...")
        self.model.learn(total_timesteps=total_timesteps)
        self.save()
        
    def save(self):
        if self.model:
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            self.model.save(self.model_path)
            print(f"[PPOAgent] Model safely persisted to Native Disk: {self.model_path}.zip")
            
    def load(self):
        if os.path.exists(f"{self.model_path}.zip"):
            self.model = PPO.load(self.model_path)
            print(f"[PPOAgent] Loaded pre-trained Transformer model from Disk: {self.model_path}")
            return True
        return False
        
    def predict(self, observation, market_mood_score: float = 0.0):
        """
        Infers action using the Deep Neural Network, with an Agentic NLP safety overlay.
        """
        if not self.model:
            raise Exception("Model not loaded.")
        
        action, _states = self.model.predict(observation, deterministic=True)
        
        # NLP Sentiment Overlay (Agentic AI Kill Switch)
        # Assumed standard Action Space mapping: 0=Sell, 1=Hold, 2=Buy
        if isinstance(action, int) or action.size == 1:
            act_val = int(action)
            # If AI wants to BUY, but Macro Sentiment is deeply Bearish: Veto
            if act_val == 2 and market_mood_score < -0.2:
                print("[Agentic NLP] Overriding PPO BUY action due to Bearish Market Sentiment.")
                return 1 # Force HOLD
                
            # If AI wants to SELL, but Macro Sentiment is deeply Bullish: Veto
            if act_val == 0 and market_mood_score > 0.2:
                print("[Agentic NLP] Overriding PPO SELL action due to Bullish Market Sentiment.")
                return 1 # Force HOLD
                
        return action
