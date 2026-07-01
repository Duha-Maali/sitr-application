# SITR — Privacy-Aware Hijab Detection Mobile Application

SITR is an AI-powered mobile application designed to help protect the privacy of hijab-wearing women when sharing digital images.

The system detects faces in an uploaded image, verifies whether the detected individuals are registered family members, and checks whether recognized female family members are wearing a hijab. If an uncovered female family member is detected, the application automatically blurs the head and neck area before the image is shared.

SITR integrates face detection using MTCNN, facial verification using FaceNet embeddings, vector similarity search using ChromaDB, and a hijab classification model based on an enhanced DenseNet121 architecture. The project was developed as a graduation project by a three-member team, with separate contributions in mobile frontend development, hijab detection model development, and backend and face-recognition integration.

## How It Works

1. The user registers family members by uploading multiple reference images for each person.
2. The backend detects faces in the uploaded images using MTCNN.
3. FaceNet generates facial embeddings for the detected faces.
4. The embeddings are stored in ChromaDB and linked to the corresponding user and family member.
5. When the user uploads a new image, the system detects all faces in it.
6. Each detected face is compared with the stored embeddings using cosine similarity.
7. If a detected face matches a registered female family member, the face is passed to the hijab detection model.
8. If the system determines that the recognized female is not wearing a hijab, the head and neck area is automatically blurred before the image is shared.

## Key Features

- Register and manage family members.
- Upload multiple reference images for each family member.
- Detect faces in uploaded images using MTCNN.
- Generate facial embeddings using FaceNet.
- Store and search face embeddings using ChromaDB.
- Verify whether detected faces belong to registered family members.
- Detect hijab presence for recognized female family members.
- Automatically blur uncovered head and neck areas.
- Return a privacy-protected image that is safer to share.
- Support both Arabic and English in the mobile application.

## Technology Stack

### Mobile Application
- React Native
- Expo
- TypeScript
- Clerk Authentication
- Convex

### Backend and Face Recognition
- Python
- Flask
- MTCNN
- FaceNet
- ChromaDB
- OpenCV

### Hijab Detection
- PyTorch
- DenseNet121
- Efficient Channel Attention (ECA)

### Deployment and Tools
- Render
- Git and GitHub

## Project Structure

```text
SITR-Application/
├── frontend/          # React Native mobile application
├── backend/           # Flask API, face processing, and ChromaDB integration
├── hijab-detection/   # Hijab classification model and related files
└── data/
    └── chroma_data/   # Persistent face embeddings stored by ChromaDB

Each component was developed separately and integrated to form the complete SITR image privacy workflow.
```
## Team Contributions

This project was developed collaboratively by a three-member team:

- **Duha Maali — Backend and Face Recognition**
  - Developed the Flask backend APIs.
  - Implemented face detection and facial embedding generation.
  - Integrated FaceNet with ChromaDB for face verification.
  - Managed face enrollment, recognition, and family-member embedding deletion.
  - Integrated the backend with the mobile application and hijab detection service.

- **Saja Hammad — Mobile Frontend**
  - Developed the React Native mobile application.
  - Implemented the user interface, navigation, authentication, and API integration.

- **Hadeel Bkhaitan — Hijab Detection Model**
  - Prepared and processed the hijab image dataset.
  - Trained and evaluated the hijab classification models.
  - Developed the enhanced DenseNet121 model with Efficient Channel Attention.
  - Prepared and deployed the final hijab detection model.

## Results

The enhanced DenseNet121 hijab detection model achieved:

- **Test Accuracy:** 92.16%
- **F1-Score:** 86.39%
- **Test Loss:** 0.2173
- **Average Inference Time:** Approximately 19 seconds per image

The model size was reduced from approximately 82 MB to 27 MB using dynamic quantization, which made deployment more practical.

## Privacy and Ethical Considerations

SITR was designed as a privacy-focused academic project. The system processes family images and facial embeddings only to identify registered family members and protect hijab-related privacy.

Facial embeddings are used for similarity matching rather than storing them as ordinary profile images. Users remain responsible for obtaining consent before registering or processing another person’s images.

The project is an academic prototype and should undergo additional security, privacy, and legal review before being used in a production environment.

## Project Status

SITR was developed as a university graduation project and represents a functional academic prototype.

The main components of the system were implemented and integrated, including the mobile application, face detection and recognition backend, ChromaDB-based embedding storage, hijab detection model, and automatic image blurring workflow.

The repository is intended for academic review, demonstration, and portfolio purposes. Additional work would be required before using the system in a production environment.
