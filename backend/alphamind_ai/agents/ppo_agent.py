import os
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv
from app.core.config import settings

class PPOTradingAgent:
    """
    Wraps the Stable-Baselines3 PPO Neural Network into an easily manageable
    local class natively saved to the Windows disk instead of MLFlow Docker.
    """
    def __init__(self, env=None, model_path: str = "ppo_alphamind_v1"):
        self.env = env
        self.model_path = os.path.join(os.path.dirname(__file__), "models", model_path)
        self.model = None

    def create_model(self):
        if not self.env:
            raise ValueError("Environment not provided for model creation.")
            
        # Vectorized environment required for SB3
        vec_env = DummyVecEnv([lambda: self.env])
        
        self.model = PPO(
            "MlpPolicy", 
            vec_env, 
            verbose=1,
            learning_rate=0.0003,
            n_steps=2048,
            batch_size=64,
            gamma=0.99
        )
        print(f"[PPOAgent] Initialized fresh AlphaMind {settings.APP_VERSION} neural network.")

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
            print(f"[PPOAgent] Loaded pre-trained model from Native Disk: {self.model_path}")
            return True
        return False
        
    def predict(self, observation):
        if not self.model:
            raise Exception("Model not loaded.")
        action, _states = self.model.predict(observation, deterministic=True)
        return action
