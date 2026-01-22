"""
FastAPI development server for local testing.
This is NOT used in production (Runpod uses handler.py).
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import httpx
import logging

from src.pipeline import ImageGenerationPipeline
from src.prompt_builder import build_prompt, get_negative_prompt
from src.storage import S3Storage
from src.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Studio Inference Server", version="1.0.0")

# Initialize components (lazy loading for faster startup)
pipeline: Optional[ImageGenerationPipeline] = None
storage: Optional[S3Storage] = None

def get_pipeline() -> ImageGenerationPipeline:
    global pipeline
    if pipeline is None:
        pipeline = ImageGenerationPipeline()
    return pipeline

def get_storage() -> S3Storage:
    global storage
    if storage is None:
        storage = S3Storage()
    return storage

class GenerationRequest(BaseModel):
    jobId: str
    type: str
    userId: str
    data: Dict[str, Any]

class GenerationResponse(BaseModel):
    jobId: str
    status: str
    imageUrl: Optional[str] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "model": settings.model_id}

@app.post("/generate", response_model=GenerationResponse)
async def generate_image(request: GenerationRequest):
    """
    Generate image endpoint for local testing.
    Mimics Runpod handler behavior.
    """
    try:
        logger.info(f"Processing job {request.jobId}")
        
        # Build prompt
        prompt = build_prompt(request.data)
        controls = request.data.get("controls", {})
        negative_prompt = get_negative_prompt(controls.get("style", "photorealistic"))
        
        # Generate image
        pipe = get_pipeline()
        image = pipe.generate(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=settings.default_steps,
            guidance_scale=settings.default_guidance_scale,
            width=settings.default_width,
            height=settings.default_height,
        )
        
        # Upload to S3
        store = get_storage()
        generation_id = request.data.get("generationId")
        image_key = f"generations/{request.userId}/{generation_id}.png"
        image_url = store.upload_image(image, image_key)
        
        # Callback to API
        await send_callback({
            "jobId": request.jobId,
            "status": "success",
            "imageUrl": image_url,
            "metadata": {
                "model": settings.model_id,
                "steps": settings.default_steps,
                "guidance_scale": settings.default_guidance_scale,
            }
        })
        
        logger.info(f"Job {request.jobId} completed successfully")
        
        return GenerationResponse(
            jobId=request.jobId,
            status="success",
            imageUrl=image_url,
            metadata={
                "model": settings.model_id,
                "steps": settings.default_steps,
            }
        )
        
    except Exception as e:
        logger.error(f"Job {request.jobId} failed: {str(e)}")
        
        # Send failure callback
        await send_callback({
            "jobId": request.jobId,
            "status": "failed",
            "error": str(e),
        })
        
        raise HTTPException(status_code=500, detail=str(e))

async def send_callback(data: dict):
    """Send callback to API server."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(settings.api_callback_url, json=data)
            response.raise_for_status()
            logger.info(f"Callback sent for job {data['jobId']}")
    except Exception as e:
        logger.error(f"Failed to send callback: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
