import torch
from diffusers import Flux2KleinPipeline
import logging
from PIL import Image
from typing import Optional
from src.config import settings

logger = logging.getLogger(__name__)

class ImageGenerationPipeline:
    
    def __init__(self):
        model_id = settings.model_id
        logger.info(f"Loading model: {model_id}")
        logger.info(f"Using device: {settings.device}")
    
        self.pipe = Flux2KleinPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.bfloat16,
            device_map=settings.device,
        )
        #self.pipe.enable_model_cpu_offload() 

        logger.info("Pipeline loaded successfully")
    
    def generate(
            self,
            prompt: str,
            negative_prompt: str = "",
            num_inference_steps: Optional[int] = None,
            guidance_scale: Optional[float] = None,
            width: int = 1024,
            height: int = 1024,
            seed: Optional[int] = None,
    ) -> Image.Image: 
        
            logger.info(f"Generating image with prompt: {prompt}")

            if num_inference_steps is None:
                num_inference_steps = 4
            if guidance_scale is None:
                guidance_scale = 0.0 

            generator = None
            if seed is not None:
                generator = torch.Generator(device=settings.device).manual_seed(seed)
            else:
                 import random
                 seed = random.randint(0, 2**32 - 1)
                 generator = torch.Generator(device=settings.device).manual_seed(seed)

            logger.info(f"Steps={num_inference_steps}, CFG={guidance_scale}, Seed={seed}, Size={width}x{height}")

            result = self.pipe(
                prompt=prompt,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                width=width,
                height=height,
                generator=generator,
            )
            image = result.images[0]
            logger.info("Image generated successfully")

            return image
