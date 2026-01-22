"""
Runpod serverless handler for image generation.
This is the production entry point deployed to Runpod.
"""

import runpod
from src.pipeline import ImageGenerationPipeline
from src.storage import S3Storage
from src.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize pipeline once at container start
pipeline = ImageGenerationPipeline()
storage = S3Storage()

def handler(job: dict) -> dict:
    """
    Runpod handler function.
    
    Expected input:
    {
        "jobId": "uuid",
        "type": "GENERATE_IMAGE",
        "userId": "uuid",
        "data": {
            "generationId": "uuid",
            "character": {...},
            "scene": {...},
            "controls": {...}
        }
    }
    """
    try:
        job_input = job.get("input", {})
        job_id = job_input.get("jobId")
        user_id = job_input.get("userId")
        data = job_input.get("data", {})
        
        logger.info(f"Processing job {job_id}")
        
        # Build prompt
        from src.prompt_builder import build_prompt
        prompt = build_prompt(data)
        
        # Generate image
        image = pipeline.generate(
            prompt=prompt,
            negative_prompt=get_negative_prompt(data.get("controls", {})),
            num_inference_steps=settings.default_steps,
            guidance_scale=settings.default_guidance_scale,
            width=settings.default_width,
            height=settings.default_height,
        )
        
        # Upload to S3
        generation_id = data.get("generationId")
        image_key = f"generations/{user_id}/{generation_id}.png"
        image_url = storage.upload_image(image, image_key)
        
        logger.info(f"Job {job_id} completed successfully")
        
        return {
            "jobId": job_id,
            "status": "success",
            "imageUrl": image_url,
            "metadata": {
                "model": settings.model_id,
                "steps": settings.default_steps,
                "guidance_scale": settings.default_guidance_scale,
            }
        }
        
    except Exception as e:
        logger.error(f"Job {job_id} failed: {str(e)}")
        return {
            "jobId": job_id,
            "status": "failed",
            "error": str(e),
        }

def get_negative_prompt(controls: dict) -> str:
    """Build negative prompt based on style."""
    base_negative = "low quality, blurry, distorted, disfigured, bad anatomy"
    
    style = controls.get("style", "")
    if style == "photorealistic":
        return f"{base_negative}, cartoon, illustration, anime, painting"
    elif style == "illustration":
        return f"{base_negative}, photograph, realistic, photorealistic"
    else:
        return base_negative

# Register handler
runpod.serverless.start({"handler": handler})
