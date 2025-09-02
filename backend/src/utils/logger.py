import logging
import os
from config import Config

def setup_logger():
    os.makedirs(Config.LOGS_DIR, exist_ok=True)
    logging.basicConfig(
        filename=Config.LOG_FILE,
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    return logging.getLogger()