"""
S3 storage handler for uploading generated images.
"""

import boto3
from botocore.client import Config
from PIL import Image
from io import BytesIO
import logging
from src.config import settings

logger = logging.getLogger(__name__)

class S3Storage:
    """Handles image uploads to S3-compatible storage."""
    
    def __init__(self):
        """Initialize S3 client."""
        self.client = boto3.client(
            's3',
            endpoint_url=settings.s3_endpoint,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.s3_region,
            config=Config(signature_version='s3v4'),
        )
        self.bucket = settings.s3_bucket
    
    def upload_image(self, image: Image.Image, key: str) -> str:
        """
        Upload PIL Image to S3.
        
        Args:
            image: PIL Image to upload
            key: S3 object key (path)
            
        Returns:
            Public URL of uploaded image
        """
        logger.info(f"Uploading image to s3://{self.bucket}/{key}")
        
        # Convert image to bytes
        buffer = BytesIO()
        image.save(buffer, format='PNG', optimize=True)
        buffer.seek(0)
        
        # Upload
        self.client.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=buffer,
            ContentType='image/png',
            ACL='public-read',
        )
        
        # Construct URL
        if settings.s3_endpoint:
            url = f"{settings.s3_endpoint}/{self.bucket}/{key}"
        else:
            url = f"https://{self.bucket}.s3.{settings.s3_region}.amazonaws.com/{key}"
        
        logger.info(f"Image uploaded: {url}")
        return url
    
    def delete_image(self, key: str):
        """Delete image from S3."""
        logger.info(f"Deleting image: s3://{self.bucket}/{key}")
        self.client.delete_object(Bucket=self.bucket, Key=key)
