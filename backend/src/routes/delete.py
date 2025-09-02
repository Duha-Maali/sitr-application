from flask import Blueprint, request, jsonify
from utils.logger import setup_logger
from services.delete_processor import DeleteProcessor

delete_bp = Blueprint('delete', __name__)
logger = setup_logger()
delete_processor = DeleteProcessor(logger)

@delete_bp.route('/delete_family_member', methods=['DELETE'])
def delete_family_member():
    try:
        logger.info("Received /delete_family_member request")
        data = request.get_json()
        user_id = data.get('user_id')
        family_member_id = data.get('family_member_id')

        # Input validation
        if not user_id or not user_id.strip() or not family_member_id or not family_member_id.strip():
            logger.error(f"Invalid input: user_id={user_id}, family_member_id={family_member_id}")
            return jsonify({
                "status": "error",
                "message": "user_id and family_member_id are required"
            }), 400

        # Perform deletion synchronously
        result = delete_processor.delete_records(user_id, family_member_id)
        
        if result["status"] == "failed":
            logger.info(f"Deletion failed for user_id={user_id}, family_member_id={family_member_id}: {result['message']}")
            return jsonify({
                "status": "error",
                "message": result["message"],
                "errors": result["errors"]
            }), 404 if result["message"] == "No records found for the specified family member" else 500

        logger.info(f"Successfully deleted {result['deleted_count']} records for user_id={user_id}, family_member_id={family_member_id}")
        return jsonify({
            "status": "success",
            "message": "All records deleted successfully",
            "deleted_count": result["deleted_count"]
        }), 200

    except Exception as e:
        logger.error(f"Error in /delete_family_member: {str(e)}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500