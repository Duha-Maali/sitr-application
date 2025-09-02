from utils.logger import setup_logger
from chroma_setup import chroma_client, collection

class DeleteProcessor:
    def __init__(self, logger):
        self.chroma_client = chroma_client
        self.collection = collection
        self.logger = logger

    def delete_records(self, user_id, family_member_id):
        try:
            # Query ChromaDB for records matching user_id and family_member_id
            results = self.collection.get(
                where={"$and": [
                    {"user_id": user_id},
                    {"family_member_id": family_member_id}
                ]},
                include=["metadatas"]
            )
            record_ids = results.get('ids', [])
            self.logger.info(f"Found {len(record_ids)} records for user_id={user_id}, family_member_id={family_member_id}")

            if not record_ids:
                return {
                    "status": "failed",
                    "errors": [{"error": "No records found"}],
                    "message": "No records found for the specified family member",
                    "deleted_count": 0
                }

            # Log the record IDs to be deleted
            self.logger.info(f"Deleting records with IDs: {record_ids}")

            # Delete records from ChromaDB
            self.collection.delete(ids=record_ids)
            deleted_count = len(record_ids)

            return {
                "status": "completed",
                "errors": [],
                "message": "All records for deleted successfully",
                "deleted_count": deleted_count
            }

        except Exception as e:
            self.logger.error(f"Deletion failed: {str(e)}")
            return {
                "status": "failed",
                "errors": [{"error": str(e)}],
                "message": "Processing failed",
                "deleted_count": 0
            }