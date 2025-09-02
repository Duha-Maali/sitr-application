from flask import Blueprint, request, jsonify, send_file
import json
import uuid 
import threading
import io
import os
from services.image_processor_recognize import ImageProcessorRecognize
from utils.logger import setup_logger

recognize_bp = Blueprint('recognize', __name__)
logger = setup_logger()
image_processor = ImageProcessorRecognize()
task_status_recognize = {}
task_lock_recognize = threading.Lock()

@recognize_bp.route('/recognize_faces', methods=['POST'])
def recognize_faces():
    try:
        logger.info(f"Received /recognize_faces request")
        
        if 'image' not in request.files or not request.files['image'].filename:
            logger.error("No image file provided")
            return jsonify({"status": "error", "message": "Image file required"}), 400
        
        image = request.files['image']
        if not image.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            logger.error(f"Invalid image format: {image.filename}")
            return jsonify({"status": "error", "message": "Image must be JPEG or PNG"}), 400
        
        user_id = request.form.get('user_id')
        if not user_id or not user_id.strip():
            logger.error("Missing or empty user_id")
            return jsonify({"status": "error", "message": "user_id required"}), 400
        
        family_member_ids = request.form.get('family_member_ids')
        if not family_member_ids:
            logger.error("Missing family_member_ids")
            return jsonify({"status": "error", "message": "family_member_ids required"}), 400
        
        try:
            family_members = json.loads(family_member_ids)
            if not isinstance(family_members, list) or not family_members:
                raise ValueError("family_member_ids must be a non-empty list")
            for fm in family_members:
                if not isinstance(fm, dict) or \
                   not fm.get('id') or \
                   fm.get('gender') not in ['male', 'female'] or \
                   not isinstance(fm.get('hijab'), bool):
                    raise ValueError("Invalid family_member_ids format")
        except ValueError as e:
            logger.error(f"Invalid family_member_ids: {str(e)}")
            return jsonify({"status": "error", "message": str(e)}), 400

        logger.info(f"Received /recognize_faces request for user_id={user_id} with {len(family_members)} family members")
        
        image_data = image.read()
        task_id = str(uuid.uuid4())
        
        with task_lock_recognize:
            task_status_recognize[task_id] = {
                "status": "queued",
                "errors": [],
                "message": ""
            }
        
        logger.info(f"Started task {task_id} for user_id={user_id}")
        threading.Thread(
            target=image_processor.recognize_faces,
            args=(user_id, family_members, image_data, task_id, task_status_recognize, task_lock_recognize),
            daemon=True
        ).start()
        
        
        logger.info(f"Launched recognition thread for task {task_id}")
        logger.info(f"Current tasks: {task_status_recognize}")
        return jsonify({"task_id": task_id, "status": "queued"}), 200
    
    except Exception as e:
        logger.error(f"Error in /recognize_faces: {str(e)}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500

@recognize_bp.route('/status_rec/<task_id>', methods=['GET'])
def get_status(task_id):
    logger.info(f"Checking status for task: {task_id}")
    try:
        with task_lock_recognize:
            if task_id in task_status_recognize:
                task_data = task_status_recognize[task_id]
                logger.info(f"Task {task_id} status: {task_data['status']}")
                
                response_data = {
                    "status": task_data["status"],
                    "message": task_data.get("message", ""),
                    "errors": task_data["errors"],
                    "result": task_data.get("result", None)
                }
                
                return jsonify(response_data), 200
                
        logger.error(f"Task not found: {task_id}")
        return jsonify({"status": "error", "message": "Task not found"}), 404
    except Exception as e:
        logger.error(f"Error in /status_rec/{task_id}: {str(e)}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500

@recognize_bp.route('/result_image/<task_id>', methods=['GET'])
def get_result_image(task_id):
    logger.info(f"Getting result image for task: {task_id}")
    try:
        with task_lock_recognize:
            if task_id in task_status_recognize:
                task_data = task_status_recognize[task_id]
                logger.info(f"Task data: {task_data}")
                
                if task_data["status"] != "completed":
                    logger.error(f"Task {task_id} status is {task_data['status']}, not completed")
                    return jsonify({"status": "error", "message": "Task not completed yet"}), 400
                
                rel_path = task_data.get("result")
                logger.info(f"Relative path from task: {rel_path}")
                if not rel_path:
                    logger.error(f"No result path found in task {task_id}")
                    return jsonify({"status": "error", "message": "No result image available"}), 404
                
                # Get the backend directory by going up from this file's location
                current_file_dir = os.path.dirname(os.path.abspath(__file__))  # /path/to/backend/src/routes
                src_dir = os.path.dirname(current_file_dir)  # /path/to/backend/src
                backend_dir = os.path.dirname(src_dir)  # /path/to/backend
                
                # Build full path to the result image (relative path is from backend directory)
                full_image_path = rel_path
                
                logger.info(f"Current file dir: {current_file_dir}")
                logger.info(f"Backend dir: {backend_dir}")
                logger.info(f"src dir: {src_dir}")
                logger.info(f"Full image path: {full_image_path}")
                logger.info(f"File exists: {os.path.exists(full_image_path)}")
                
                if not os.path.exists(full_image_path):
                    logger.error(f"Result image not found: {full_image_path}")
                    # Try to list what files are actually in the directory
                    result_dir = os.path.dirname(full_image_path)
                    if os.path.exists(result_dir):
                        files_in_dir = os.listdir(result_dir)
                        logger.info(f"Files in result directory {result_dir}: {files_in_dir}")
                    else:
                        logger.info(f"Result directory does not exist: {result_dir}")
                    return jsonify({"status": "error", "message": "Result image file not found"}), 404
                
                logger.info(f"Sending file: {full_image_path}")
                return send_file(full_image_path, mimetype='image/png')
                
        logger.error(f"Task not found: {task_id}")
        return jsonify({"status": "error", "message": "Task not found"}), 404
    except Exception as e:
        logger.error(f"Error in /result_image/{task_id}: {str(e)}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500

