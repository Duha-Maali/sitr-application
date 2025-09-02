from flask import Blueprint, request, jsonify
import uuid
import threading
from services.image_processor import ImageProcessor
from utils.logger import setup_logger
from config import Config

process_bp = Blueprint('process', __name__)
logger = setup_logger()
image_processor = ImageProcessor(logger)
task_status = {}
task_lock = threading.Lock()

@process_bp.route('/process', methods=['POST'])
def process():
    data = request.get_json()
    user_id = data.get('user_id')
    family_member_id = data.get('family_member_id')
    urls = data.get('urls', [])
    
    if not user_id or not family_member_id or not (Config.MIN_URLS <= len(urls) <= Config.MAX_URLS):
        logger.error(f"Invalid input: user_id={user_id}, family_member_id={family_member_id}, urls_count={len(urls)}")
        return jsonify({"error": f"Invalid input: user_id, family_member_id, and {Config.MIN_URLS}-{Config.MAX_URLS} URLs required"}), 400
    
    task_id = str(uuid.uuid4())
    with task_lock:
        task_status[task_id] = {"status": "queued", "errors": [], "message": ""}
    logger.info(f"Started task {task_id} for user_id={user_id}, family_member_id={family_member_id}")
    
    # Start processing in a separate thread
    threading.Thread(
        target=image_processor.process_images,
        args=(user_id, family_member_id, urls, task_id, task_status, task_lock),
        daemon=True
    ).start()
    
    return jsonify({"task_id": task_id, "status": "queued"})

@process_bp.route('/status/<task_id>', methods=['GET'])
def get_status(task_id):
    with task_lock:
        if task_id not in task_status:
            logger.error(f"Task not found: {task_id}")
            return jsonify({"error": "Task not found"}), 404
        return jsonify({
            "status": task_status[task_id]["status"],
            "message": task_status[task_id].get("message", ""),
            "errors": task_status[task_id]["errors"]
        })