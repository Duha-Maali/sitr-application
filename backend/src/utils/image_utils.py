import requests
from PIL import Image, ImageDraw
import io
import os
from config import Config

def download_image(url: str, logger) -> bytes:
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.content
        raise Exception(f"Failed to download: {response.status_code}") #404:NotFound
    except Exception as e:
        logger.error(f"Download error for {url}: {str(e)}")
        raise Exception(f"Download error: {str(e)}")

def save_image_with_bbox(img: Image.Image, box: list[float], task_id: str, url: str, logger):
    try:
        draw = ImageDraw.Draw(img)
        # Box format: [left, top, right, bottom]
        # draw.rectangle(box, outline='red', width=2)
        left, top, right, bottom = map(int, box)
        #new code
        #green instead of red
        #
        draw.rectangle([(left, top), (right, bottom)], outline='green', width=2)
        #new code
        if img.mode != 'RGB':
            img = img.convert('RGB')
        #
        output_dir = os.path.join(Config.PROCESSED_IMAGES_DIR, task_id)
        os.makedirs(output_dir, exist_ok=True)
        #new code
        filename = os.path.splitext(os.path.basename(url))[0] + '.jpg'
        full_path = os.path.join(output_dir, filename)
        #
        filename = f"{output_dir}/{url.split('/')[-1]}"
        #new code: write full_path instead of filename
        img.save(full_path, 'JPEG')
        logger.info(f"Saved image with bounding box: {filename}")
    except Exception as e:
        logger.error(f"Error saving image with bounding box for {url}: {str(e)}")