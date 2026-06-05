import torch
import torch.nn as nn

class TurboQuantizer(nn.Module):
    """
    Implementation of Google's SOTA TurboQuant compression algorithm.
    Features:
    1. Random Rotation (PolarQuant): Uses a random orthogonal matrix generated via QR decomposition.
    2. Scalar Quantization: Quantizes the rotated vectors to 3-bit (8 bins) or 4-bit (16 bins) representations.
    3. Straight-Through Estimator (STE): Allows gradient backpropagation through the quantization step.
    """
    def __init__(self, features_dim: int, num_bits: int = 3):
        super().__init__()
        self.features_dim = features_dim
        self.num_bits = num_bits
        self.num_levels = 2 ** num_bits
        
        # Generate random orthogonal rotation matrix Q via QR decomposition
        # We register it as a buffer so it is saved/loaded with state_dict but not optimized
        random_matrix = torch.randn(features_dim, features_dim)
        q, _ = torch.linalg.qr(random_matrix)
        self.register_buffer("Q", q)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # If input has no dimensions or features_dim is mismatched, skip
        if x.shape[-1] != self.features_dim:
            return x
            
        # Step 1: Random Rotation (PolarQuant)
        x_rot = torch.matmul(x, self.Q)
        
        # Step 2: Scalar Quantization
        # Compute min/max along features dimension for normalization
        x_min = torch.min(x_rot, dim=-1, keepdim=True).values
        x_max = torch.max(x_rot, dim=-1, keepdim=True).values
        scale = (x_max - x_min) / (self.num_levels - 1)
        scale = torch.clamp(scale, min=1e-8)
        
        # Normalize and round to nearest integer bin index
        x_norm = (x_rot - x_min) / scale
        x_quant = torch.round(x_norm)
        
        # Straight-Through Estimator (STE) logic for backpropagation
        x_recon_rot = x_quant * scale + x_min
        
        # Step 3: Inverse Rotation
        x_recon = torch.matmul(x_recon_rot, self.Q.T)
        
        # During backward pass, pass gradients through directly (STE)
        if self.training:
            return x + (x_recon - x).detach()
        return x_recon
