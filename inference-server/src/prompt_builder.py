"""
Prompt builder - translates job payload into generation prompts.
"""

from typing import Dict, Any

def build_prompt(data: Dict[str, Any]) -> str:
    """
    Build generation prompt from job data.
    
    Args:
        data: Job payload containing character, scene, and controls
        
    Returns:
        Formatted prompt string
    """
    character = data.get("character", {})
    scene = data.get("scene", {})
    controls = data.get("controls", {})
    
    style = controls.get("style", "photorealistic")
    action = controls.get("action", "")
    mood = controls.get("mood", "neutral")
    shot = controls.get("shot", "portrait")
    
    prompt = f"""Generate a {style} style image.

CORE ASSETS:
- Character: {character.get('description', 'a person')}
- Setting: {scene.get('description', 'a scene')}

SCENE DESCRIPTION / ACTION:
{action}

ART DIRECTION:
- Mood: {mood}
- Shot Type: {shot}

High quality, detailed, professional photography"""
    
    return prompt.strip()

def get_negative_prompt(style: str) -> str:
    """
    Get appropriate negative prompt based on style.
    
    Args:
        style: Generation style (photorealistic, cinematic, etc.)
        
    Returns:
        Negative prompt string
    """
    base_negative = "low quality, blurry, distorted, disfigured, bad anatomy, ugly, deformed"
    
    if style == "photorealistic" or style == "cinematic":
        return f"{base_negative}, cartoon, illustration, anime, painting, drawing"
    elif style == "illustration":
        return f"{base_negative}, photograph, realistic, photorealistic"
    elif style == "anime":
        return f"{base_negative}, realistic, photorealistic, western cartoon"
    else:
        return base_negative
