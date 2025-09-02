from facenet_pytorch import MTCNN, InceptionResnetV1
import torch
import threading
from PIL import Image
import io
# import chromadb
from typing import List
from utils.image_utils import download_image, save_image_with_bbox
from config import Config
from chroma_setup import chroma_client, collection

class ImageProcessor:
    def __init__(self, logger):
        self.device = torch.device('cpu')  
        self.mtcnn = MTCNN(keep_all=False, thresholds=Config.MTCNN_THRESHOLDS, device=self.device)
        self.facenet = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)
        # self.chroma_client = chromadb.Client(chromadb.config.Settings(persist_directory="C:/Users/abeda/Desktop/BACKEND_SITR_1/chroma_data"))
        self.chroma_client = chroma_client
        self.collection = collection
        self.collection = self.chroma_client.get_or_create_collection("face_embeddings")
        self.logger = logger


    def process_images(self, user_id: str, family_member_id: str, urls: List[str], task_id: str, task_status: dict, task_lock: threading.Lock):
        with task_lock:
            task_status[task_id] = {"status": "processing", "errors": [], "message": ""}
        
        valid_images = []
        
        # Step 1: Download and validate images with MTCNN
        for url in urls:
            try:
                image_data = download_image(url, self.logger)
                img = Image.open(io.BytesIO(image_data)).convert('RGB')
                
                # Detect faces with MTCNN
                boxes, probs = self.mtcnn.detect(img)
                if boxes is None or len(boxes) == 0:
                    self.logger.warning(f"No face detected in {url}")
                    with task_lock:
                        task_status[task_id]["errors"].append({"url": url, "error": "No face detected"})
                        task_status[task_id]["status"] = "failed"
                        task_status[task_id]["message"] = "Please upload better images"
                    return
                elif len(boxes) > 1:
                    self.logger.warning(f"Multiple faces detected in {url}")
                    with task_lock:
                        task_status[task_id]["errors"].append({"url": url, "error": "Multiple faces detected"})
                        task_status[task_id]["status"] = "failed"
                        task_status[task_id]["message"] = "Please upload better images"
                    return
                elif probs[0] < Config.MTCNN_THRESHOLDS[2]:
                    self.logger.warning(f"Face confidence {probs[0]:.2f} below threshold {Config.MTCNN_THRESHOLDS[2]} in {url}")
                    with task_lock:
                        task_status[task_id]["errors"].append({"url": url, "error": f"Face confidence {probs[0]:.2f} below threshold {Config.MTCNN_THRESHOLDS[2]}"})
                        task_status[task_id]["status"] = "failed"
                        task_status[task_id]["message"] = "Please upload better images"
                    return
                else:
                    self.logger.info(f"Face detected in {url} with confidence {probs[0]:.2f}")
                    # Save image with bounding box
                    self.logger.info(f"Bound Box for {url} \n {boxes[0]}")
                    #new code
                    img_with_box = img.copy()
                    #
                    save_image_with_bbox(img_with_box, boxes[0], task_id, url, self.logger)
                    valid_images.append((url, img))
            
            except Exception as e:
                with task_lock:
                    task_status[task_id]["errors"].append({"url": url, "error": str(e)})
                    task_status[task_id]["status"] = "failed"
                    task_status[task_id]["message"] = "Please upload better images"
                return
        
        # Step 2: Generate embeddings and store in ChromaDB
        try:
            for i, (url, img) in enumerate(valid_images):
                # Extract face and generate embedding
                face = self.mtcnn(img).to(self.device)
                if face is None:
                    self.logger.error(f"Failed to extract face for {url}")
                    with task_lock:
                        task_status[task_id]["errors"].append({"url": url, "error": "Failed to extract face"})
                        task_status[task_id]["status"] = "failed"
                        task_status[task_id]["message"] = "Please upload better images"
                    return
                
                embedding = self.facenet(face.unsqueeze(0)).detach().cpu().numpy().tolist()[0]
                # self.logger.info(f"Generate embedding for {url} \n {embedding}")
                # Store in ChromaDB
                self.collection.add(
                    embeddings=[embedding],
                    metadatas=[{
                        "user_id": user_id,
                        "family_member_id": family_member_id,
                        "url": url
                    }],
                    ids=[f"{task_id}_{i}"]
                )
                self.logger.info(f"Stored embedding for {url} in ChromaDB")

            collections = self.chroma_client.list_collections()
            print("Available collections:")
            for col in collections:
                print(f"- {col.name}")
            
            # results = self.chroma_client.get_collection("face_embeddings")
            # print(f"Total stored embeddings: {len(results['ids'])}")

            # for id_, meta, emb in zip(results["ids"], results["metadatas"], results["embeddings"]):
            #     print(f"ID: {id_}")
            #     print(f"Metadata: {meta}")
            #     print(f"Embedding (first 5 values): {emb[:5]}...\n")  # Print only first 5 values to keep it readable
            collection = self.chroma_client.get_collection("face_embeddings")
            results = collection.get()  

            print(f"Total stored embeddings: {len(results['ids'])}")
            print(results)
            
            with task_lock:
                task_status[task_id]["status"] = "completed"
                task_status[task_id]["message"] = "Operation successful"
        
        except Exception as e:
            self.logger.error(f"Processing error: {str(e)}")
            with task_lock:
                task_status[task_id]["status"] = "failed"
                task_status[task_id]["message"] = f"Processing error: {str(e)}"
                task_status[task_id]["errors"].append({"url": "", "error": str(e)})