import os

class Config:
    PROCESSED_IMAGES_DIR = os.path.join(os.getcwd(), 'processed_images')
    LOGS_DIR = os.path.join(os.getcwd(), 'logs')
    LOG_FILE = os.path.join(LOGS_DIR, 'image_processing.log')
    MTCNN_THRESHOLDS = [0.6, 0.7, 0.95]
    MIN_URLS = 5
    MAX_URLS = 10
    CHROMA_DB_PATH = "C:/Users/technipal/Desktop/SITR_APP - Copy/backend/data"