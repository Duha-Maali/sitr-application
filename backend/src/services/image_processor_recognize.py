from flask import Flask, request, send_file, jsonify
import requests
import os
import io
import json
import uuid
import threading
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import torch
from facenet_pytorch import MTCNN, InceptionResnetV1
from chroma_setup import chroma_client, collection
from utils.logger import setup_logger
from utils.image_utils import save_image_with_bbox
from utils.image_utils_recognize import expand_bounding_box, apply_gaussian_blur
from config import Config
import time

logger = setup_logger()
VISUALIZATION_FOLDER = "./output/visualizations"
os.makedirs(VISUALIZATION_FOLDER, exist_ok=True)
CROPPED_FOLDER = "./output/cropped"
os.makedirs(CROPPED_FOLDER, exist_ok=True)
HIJAB_MODEL_URL = "https://hijab-model.onrender.com/predict"
UPLOAD_FOLDER = "C:/Users/abeda/Desktop/SITR_APP---Copy/output/result"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def expand_bbox(bbox, img_width, img_height):
    """
    Expand bounding box by 50% vertically and 50% horizontally, keep box centered, clamp to image boundaries.

    Args:
        bbox (list or np.ndarray): The bounding box as [x1, y1, x2, y2].
        img_width (int): Width of the image.
        img_height (int): Height of the image.

    Returns:
        list: Expanded bounding box as [x, y, w, h], clamped to image boundaries.

    The function increases the width and height of the bounding box by 50% each,
    keeping the center of the box the same. It ensures the expanded box does not
    go outside the image boundaries.
    """
    x1, y1, x2, y2 = bbox  # bbox is [x1, y1, x2, y2]
    w = x2 - x1
    h = y2 - y1
    center_x = x1 + w / 2
    center_y = y1 + h / 2
    new_w = w * 2 
    new_h = h * 2 
    new_x1 = int(round(center_x - new_w / 2))
    new_y1 = int(round(center_y - new_h / 2))
    new_x2 = int(round(center_x + new_w / 2))
    new_y2 = int(round(center_y + new_h / 2))
    # Clamp to image boundaries
    new_x1 = max(0, new_x1)
    new_y1 = max(0, new_y1)
    new_x2 = min(img_width, new_x2)
    new_y2 = min(img_height, new_y2)
    # Return as [x, y, w, h]
    return [new_x1, new_y1, new_x2 - new_x1, new_y2 - new_y1]

def gaussian_blur(image, bbox, radius=25):
    """Apply Gaussian blur to the specified region."""
    x, y, w, h = bbox
    region = image.crop((x, y, x + w, y + h))
    region = region.filter(ImageFilter.GaussianBlur(radius=radius))
    image.paste(region, (x, y))
    return image

class ImageProcessorRecognize:
    def __init__(self):
        self.mtcnn = MTCNN(keep_all=True, thresholds=[0.6, 0.7, 0.95], device='cpu')
        self.facenet = InceptionResnetV1(pretrained='vggface2').eval().to('cpu')
        self.chroma_client = chroma_client
        self.collection = collection
        

    def recognize_faces(self, user_id, family_members, image_data, task_id, task_status, task_lock):
        with task_lock:
                    task_status[task_id] = {
                        "status": "processing",
                        "errors": [],
                        "message": ""
                    }
        try:
            logger.info(f"Starting face detection for task {task_id}")
            # Stage 1: Face Detection
            img = Image.open(io.BytesIO(image_data)).convert('RGB')
            img_width, img_height = img.size
            logger.info("Initialized MTCNN with keep_all=True, thresholds=[0.6, 0.7, 0.95], device=cpu")
            boxes, probs = self.mtcnn.detect(img)
            face_results = []

            if boxes is None or len(boxes) == 0:
                logger.error("No faces detected")
                with task_lock:
                    task_status[task_id] = {
                        "status": "failed",
                        "errors": [{"error": "No faces detected or detected faces below confidence threshold"}],
                        "message": "Please upload an image with clear faces"
                    }
                logger.error(f"Task {task_id} failed due to no valid faces detected")
                return

            for idx, (box, prob) in enumerate(zip(boxes, probs)):
                logger.info(f"Detected face {idx} with box={box.tolist()}, prob={prob:.2f}")
                if prob < 0.95:
                    logger.info(f"Skipped face {idx} with confidence {prob:.2f} below threshold 0.95")
                    continue
                face_results.append({
                    "index": idx,
                    "box": box.tolist(),
                    "prob": float(prob)
                })
            
            logger.info(f"Detected {len(face_results)} valid faces in task {task_id}")
            if not face_results:
                logger.error("No faces detected or all faces below confidence threshold 0.95")
                with task_lock:
                    task_status[task_id] = {
                        "status": "failed",
                        "errors": [{"error": "No faces detected or detected faces below confidence threshold"}],
                        "message": "Please upload an image with clear faces"
                    }
                logger.error(f"Task {task_id} failed due to no valid faces detected")
                return
            print(face_results)
            # Draw bounding boxes
            img_copy = img.copy()
            draw = ImageDraw.Draw(img_copy)
            for face in face_results:
                box = face["box"]
                draw.rectangle([(box[0], box[1]), (box[2], box[3])], outline='green', width=2)
                logger.info(f"Drew bounding box for face {face['index']}: {box}")
            
            task_dir = os.path.join(Config.PROCESSED_IMAGES_DIR, task_id)
            os.makedirs(task_dir, exist_ok=True)
            bbox_path = os.path.join(task_dir, f"detected_{task_id}_bbox.jpg")
            img_copy.save(bbox_path, "JPEG")
            logger.info(f"Saved image with bounding boxes to {bbox_path}")
            logger.info(f"Stored {len(face_results)} face detection results for task {task_id}")
            logger.info(f"Task {task_id} status updated to processing: Faces detected")
            logger.info(f"Completed face detection, starting face recognition for task {task_id}")

            # Stage 2: Face Recognition
            logger.info(f"Initialized FaceNet with pretrained=vggface2, device=cpu")
            matched_faces = []
            embeddings = []

            logger.info(f"Started Generating {len(face_results)} embeddings for task {task_id}")
            faces = self.mtcnn(img)
            if faces is None or len(faces) == 0:
                logger.error("No faces detected")
                with task_lock:
                    task_status[task_id] = {
                        "status": "failed",
                        "errors": [{"error": "No faces detected or detected faces below confidence threshold"}],
                        "message": "Please upload an image with clear faces"
                    }
                logger.error(f"Task {task_id} failed due to no valid faces detected")
                return
            for idx, face in enumerate(faces):
                embedding = self.facenet(face.unsqueeze(0)).detach().cpu().numpy().tolist()[0]
                logger.info(f"Generated embedding for face {idx}")
                # print(embedding)
                embeddings.append({
                    "index": idx,
                    "embedding": embedding
                })
            print("Indexes inside embeddings:")
            for item in embeddings:
                print(item["index"])  

            processed_faces = len(face_results)
            logger.info(f"Proceesed {len(face_results)} faces ,Generated {len(embeddings)} embeddings")

            # Stage 3: Face Matching with Chroma DB
            logger.info(f"Querying ChromaDB for user_id={user_id} in task {task_id}")
            similarity_threshold = 0.7
            family_member_ids = {member['id'] for member in family_members}
            logger.info(f"Family member IDs: {family_member_ids}")

            results = collection.get(include=["embeddings", "metadatas"])
            print(f"Total embeddings stored: {len(results['ids'])}\n")

            for embedding_dict in embeddings:
                idx = embedding_dict['index']
                embedding = embedding_dict['embedding']
                logger.info(f"Querying for embedding at index {idx}")
                
                try:
                    # Query Chroma DB for the embedding, filtering by user_id
                        query_result = self.collection.query(
                            query_embeddings=[embedding],
                            n_results=5,
                            where={"user_id": user_id}
                        )
                        # query_result = self.collection.query(
                        #     query_embeddings=[embedding],
                        #     n_results=5
                        # )
                        print(f"Query Result for index{idx}: ")
                        print(query_result)

                        # Check if query returned any results
                        if not query_result['ids'] or not query_result['ids'][0]:
                            logger.info(f"No match found for embedding at index {idx}")
                            continue

                        # Extract query result details
                        result_id = query_result['ids'][0][0]
                        distance = query_result['distances'][0][0]
                        metadata = query_result['metadatas'][0][0]
                        similarity = 1 - distance
                        print("user id from metadata for index{idx}")
                        print(metadata.get('user_id'))
                        print("user id from request for index{idx}")
                        print(user_id)
                        logger.info(f"Query result for index {idx}: ID={result_id}, Similarity={similarity:.4f}, Metadata={metadata}")
                        # Check if similarity meets threshold and family_member_id is in family_members
                        if similarity >= similarity_threshold:
                            family_member_id = metadata.get('family_member_id')
                            if family_member_id in family_member_ids and metadata.get('user_id') == user_id:
                                logger.info(f"Match found for index {idx}: Family member ID {family_member_id}, User ID {user_id}, Similarity={similarity:.4f}")
                                matched_faces.append({
                                    'index': idx,
                                    'family_member_id': family_member_id,
                                    'metadata': metadata,
                                    'similarity': similarity
                                })
                            else:
                                if family_member_id not in family_member_ids:
                                    logger.info(f"No match for index {idx}: Family member ID {family_member_id} not in family_members")
                                if metadata.get('user_id') != user_id:
                                    logger.info(f"No match for index {idx}: Metadata user_id {metadata.get('user_id')} does not match provided user_id {user_id}")
                                # Remove face_results entry for this idx
                                face_results = [face for face in face_results if face['index'] != idx]    
                        else:
                            logger.info(f"No match for index {idx}: Similarity {similarity:.4f} below threshold {similarity_threshold}")
                            # Remove face_results entry for this idx
                            face_results = [face for face in face_results if face['index'] != idx]
                except Exception as e:
                    logger.error(f"Error processing embedding at index {idx}: {str(e)}")
                    continue
                #inside for loop

            print("Matched faces List: ",matched_faces)  
            print("face results List: ",face_results)  
            # Post-loop handling: Check matched_faces and update task_status
            with task_lock:
                if not matched_faces:
                    logger.info(f"No matched faces found for task {task_id}")
                    task_status[task_id] = {
                        "status": "failed",
                        "message": f"Processed {processed_faces} faces, no matches found",
                        "errors": [],
                    }
                    logger.info(f"Task {task_id} failed with no matched faces")
                    return
                else:
                    logger.info(f"Found {len(matched_faces)} matched faces for task {task_id}")
                    
            
            # Stage 4: prepare before Hijab Detection
            qualified_faces = []
            logger.info(f"Search in matched faces for members to go to hijab detetion")
            # Step through each matched face
            for match in matched_faces:
                idx = match['index']
                family_member_id = match['family_member_id']

                # Find corresponding family member
                member = next((fm for fm in family_members if fm['id'] == family_member_id), None)

                if member and member['gender'] == 'female' and member['hijab'] is True:
                    # Get corresponding face info from face_results
                    logger.info(f"found face {idx} for hijab detection")
                    face = next((fr for fr in face_results if fr['index'] == idx), None)

                    if face:
                        qualified_faces.append({
                            'index': idx,
                            'family_member_id': family_member_id,
                            'gender': member['gender'],
                            'hijab': member['hijab'],
                            'box': face['box'],
                            'prob': face['prob']
                        })
                else:
                    logger.info(f"face {idx} skipped from hijab detection")
            print("faces go to hijab detection: ",qualified_faces)
            logger.info(f"found {len(qualified_faces)} for hijab detection")

            #if qualified list is empty , response failed no hijab detection
            if not qualified_faces:
                with task_lock:
                    task_status[task_id] = {
                        "status": "failed",
                        "errors": [],
                        "message": "All matched faces appears with hijab"
                    }
                return

            logger.info(f"expand bound box for each {len(qualified_faces)}")
            # Draw expanded bounding boxes for visualization
            vis_image_expanded = img.copy()
            draw_expanded = ImageDraw.Draw(vis_image_expanded)
            for face in qualified_faces:
                box = face['box']  # This is the original box [x, y, w, h]
                expanded_bbox = expand_bbox(box, img_width, img_height)
                logger.info(f"face{idx} old box: {box}")
                logger.info(f"face{idx} expanded box: {expanded_bbox}")
                x, y, w, h = expanded_bbox
                draw_expanded.rectangle((x, y, x + w, y + h), outline="red", width=2)
            
            # Save visualization image with expanded boxes
            vis_expanded_filename = f"vis_expanded_{task_id}.png"
            vis_expanded_path = os.path.join(VISUALIZATION_FOLDER, vis_expanded_filename)
            vis_image_expanded.save(vis_expanded_path)
            logger.info(f"Task {task_id}: Expanded visualization saved to {vis_expanded_path}")

            # Process each valid face
            logger.info(f"Start Hijab detection for {len(qualified_faces)}")
            no_hijab_bboxes = []
            for face in qualified_faces:
                box = face['box']  # This is the original box [x, y, w, h]
                # Expand bounding box
                expanded_bbox = expand_bbox(box, img_width, img_height)
                x, y, w, h = expanded_bbox
                
                # Crop expanded region
                cropped_image = img.crop((x, y, x + w, y + h))
                crop_filename = f"crop_face{idx}_{task_id}.png"
                crop_path = os.path.join(CROPPED_FOLDER, crop_filename)
                cropped_image.save(crop_path)
                logger.info(f"Task {task_id}: Cropped face {idx} saved to {crop_path}")

                # Send to hijab detection model
                try:
                    with open(crop_path, "rb") as f:
                        response = requests.post(HIJAB_MODEL_URL, files={"file": f}, timeout=120)
                    response.raise_for_status()
                    result = response.json()
                    if not result.get("success") or "prediction" not in result:
                        raise ValueError("Invalid hijab model response")
                    prediction = result["prediction"]
                    label = prediction.get("label", "").lower().replace(" ", "-")  # Convert "Hijab" to "hijab", "No Hijab" to "no-hijab"
                    confidence = prediction.get("confidence", 0.0)
                    prob_hijab = prediction.get("probability_hijab", 0.0)
                    prob_no_hijab = prediction.get("probability_no_hijab", 0.0)
                    logger.info(
                        f"Task {task_id}: Face {idx} hijab detection result: "
                        f"label={label}, confidence={confidence}%, "
                        f"probability_hijab={prob_hijab}%, probability_no_hijab={prob_no_hijab}%"
                    )
                    if label == "no-hijab":
                        no_hijab_bboxes.append(expanded_bbox)

                except (requests.RequestException, ValueError) as e:
                    logger.error(f"Task {task_id}: Hijab model failed for face {idx}: {str(e)}")
                    continue
            
            if not no_hijab_bboxes:
                with task_lock:
                    task_status[task_id] = {
                        "status": "failed",
                        "errors": [],
                        "message": "All matched faces appears with hijab"
                    }
                return
            # Apply blur to no-hijab faces
            for bbox in no_hijab_bboxes:
                image = gaussian_blur(img, bbox)
            
            
            output_filename = f"output_{task_id}.png"
            output_path = os.path.join(UPLOAD_FOLDER, output_filename)
            image.save(output_path)
            
            
            with task_lock:
                task_status[task_id] = {
                    "status": "completed",
                    "errors": [],
                    "message": "Processing Successful",
                    "result": output_path
                }
                    
                
        except Exception as e:
            logger.error(f"Task {task_id} failed: {str(e)}")
            with task_lock:
                task_status[task_id] = {
                    "status": "failed",
                    "errors": [{"error": str(e)}],
                    "message": "Processing failed"
                }


