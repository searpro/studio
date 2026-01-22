"""
Configuration settings loaded from environment variables.
"""

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # AWS / S3
    aws_access_key_id: str
    aws_secret_access_key: str
    s3_endpoint: Optional[str] = None
    s3_bucket: str = "studio-assets"
    s3_region: str = "us-east-1"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # API
    api_callback_url: str
    
    # Model
    model_id: str = "black-forest-labs/FLUX.2-klein-4B"
    device: str = "mps"  # cuda, cpu, or mps

    # Hugging Face
    hf_hub_enable_hf_transfer: Optional[str] = True
    hf_endpoint: Optional[str] = "https://hf-mirror.com"
    
    # Generation defaults
    default_steps: int = 30
    default_guidance_scale: float = 7.5
    default_width: int = 1024
    default_height: int = 1024
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
