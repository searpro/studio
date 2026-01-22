import torch
from diffusers import Flux2KleinPipeline, FlowMatchEulerDiscreteScheduler
from PIL import Image
import logging
import random
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
        ).to(settings.device)

        # Match ComfyUI-like sampler behavior
        self.pipe.scheduler = FlowMatchEulerDiscreteScheduler.from_config(
            self.pipe.scheduler.config
        )

        # Important quality/perf options
        self.pipe.enable_attention_slicing()
        #self.pipe.enable_vae_slicing()
        #self.pipe.enable_vae_tiling()

        # If available (huge improvement on Ampere+)
        try:
            self.pipe.enable_xformers_memory_efficient_attention()
        except:
            pass

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

        if num_inference_steps is None:
            num_inference_steps = 28  # Much closer to Comfy defaults

        if guidance_scale is None:
            guidance_scale = 4.5  # FLUX performs best around 3–6

        if seed is None:
            seed = random.randint(0, 2**32 - 1)

        generator = torch.Generator(device=settings.device).manual_seed(seed)

        logger.info(
            f"Prompt: {prompt}\n"
            f"Steps={num_inference_steps}, CFG={guidance_scale}, Seed={seed}, Size={width}x{height}"
        )

        result = self.pipe(
            prompt=prompt,
            #negative_prompt=negative_prompt,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            width=width,
            height=height,
            generator=generator,
        )

        image = result.images[0]
        logger.info("Image generated successfully")

        return image
