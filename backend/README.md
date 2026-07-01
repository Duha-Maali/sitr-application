# SITR Backend

The SITR backend is a Flask-based image-processing API responsible for face enrollment, face detection, facial embedding generation, face verification, and ChromaDB integration.

It connects the mobile application with the face-recognition pipeline and the hijab detection service. The backend processes reference images for registered family members, stores their facial embeddings, recognizes family members in newly uploaded images, and supports the privacy-protection workflow before an image is returned to the user.

This component was developed as part of the SITR graduation project, an AI-powered mobile application designed to help protect the privacy of hijab-wearing women when sharing digital images.

## My Responsibilities

I was responsible for developing and integrating the backend and face-recognition components of the SITR application, including:

- Building the Flask API and organizing the backend into routes, services, and utility modules.
- Implementing family-member face enrollment from multiple reference images.
- Detecting faces using MTCNN.
- Generating facial embeddings using FaceNet.
- Storing and querying embeddings in ChromaDB.
- Filtering face-recognition searches by user and family-member metadata.
- Implementing face-recognition and similarity-matching workflows.
- Supporting deletion of stored family-member embeddings.
- Integrating the backend with the mobile application and the hijab-detection service.
- Adding asynchronous task processing and status-check endpoints for long-running image operations.

## Backend Workflow

### 1. Family Member Enrollment

1. The mobile application sends the user ID, family-member ID, and multiple reference-image URLs to the backend.
2. The backend downloads and validates the images.
3. MTCNN detects the face in each image.
4. FaceNet generates a facial embedding for every valid detected face.
5. The embeddings are stored in ChromaDB with metadata linking them to the corresponding user and family member.
6. The backend provides a task ID that the mobile application can use to check the processing status.

### 2. Face Recognition

1. The user uploads a new image through the mobile application.
2. The backend detects all faces in the image.
3. FaceNet generates an embedding for each detected face.
4. ChromaDB searches for the most similar stored embeddings using cosine similarity.
5. The search is limited to family members registered under the current user.
6. Matching faces are identified and forwarded to the next stage of the privacy-protection workflow.

### 3. Hijab Privacy Processing

1. Recognized female family members are checked by the hijab-detection service.
2. If a recognized female is detected without a hijab, the corresponding head and neck area is blurred.
3. The processed image is returned to the mobile application.

### 4. Family Member Deletion

When a family member is removed, the backend deletes all facial embeddings associated with that user and family-member ID from ChromaDB.

## Main Technologies

- **Python** — Backend development and image-processing logic.
- **Flask** — Building the REST API and organizing endpoints using Blueprints.
- **MTCNN** — Detecting faces in uploaded and reference images.
- **FaceNet** — Generating facial embeddings for identity verification.
- **ChromaDB** — Persisting facial embeddings and performing similarity search.
- **OpenCV** — Image loading, processing, and drawing or applying image modifications.
- **Cosine Similarity** — Comparing facial embeddings to identify registered family members.
- **Threading** — Running long image-processing tasks asynchronously and tracking their status.

## API Endpoints

### Face Enrollment

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/process` | Starts processing reference images for a family member and stores generated face embeddings in ChromaDB. |
| `GET` | `/status/<task_id>` | Returns the current status and result of the enrollment task. |

### Face Recognition

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/recognize_faces` | Detects and recognizes registered family members in an uploaded image. |
| `GET` | `/status_rec/<task_id>` | Returns the current status and result of the recognition task. |

### Family Member Data

| Method | Endpoint | Description |
|---|---|---|
| `DELETE` | `/delete_family_member` | Deletes all stored face embeddings associated with a specific user and family member. |

Long-running enrollment and recognition operations return a task ID, allowing the mobile application to poll the corresponding status endpoint until processing is completed or fails.

## ChromaDB Design

ChromaDB is used as the vector database for storing and searching facial embeddings.

Each stored embedding is linked to metadata that identifies:

- The application user.
- The corresponding family member.
- The face record associated with that person.

The backend stores multiple embeddings for each family member to improve recognition across different images, angles, lighting conditions, and facial expressions.

During face recognition, the generated embedding is compared with stored embeddings using cosine similarity. The search is filtered by the current user so that each user’s family-member data remains logically separated.

ChromaDB is also used to delete all embeddings associated with a family member when that member is removed from the application.

## Project Structure

```text
backend/
├── src/
│   ├── routes/            # API endpoints for enrollment, recognition, status, and deletion
│   ├── services/          # Face processing, embedding generation, and recognition logic
│   ├── utils/             # Image-processing and logging utilities
│   ├── app.py             # Flask application entry point
│   ├── config.py          # Backend configuration
│   └── chroma_setup.py    # ChromaDB client and collection setup
├── requirements.txt       # Python dependencies
├── script.py              # Utility script for inspecting or managing ChromaDB records
└── info.txt               # API notes and testing examples

The backend separates API routes, processing services, utility functions, and database configuration to keep responsibilities organized and make the code easier to maintain.
```

## Limitations

- The backend was developed as an academic prototype and is not production-ready.
- Background image-processing tasks are managed using in-memory threads and task-status dictionaries, so task information is lost if the server restarts.
- The current implementation uses local ChromaDB storage and requires configuration changes when running on a different device.
- API authentication and authorization are not fully enforced at the Flask backend level.
- Processing time may increase when handling multiple faces or several reference images.
- The system depends on image quality, lighting, face angle, and visibility for reliable face detection and recognition.

## Project Status

This backend was developed as part of the SITR university graduation project.

The main backend features were implemented and integrated, including family-member enrollment, face detection, facial embedding generation, ChromaDB storage, face recognition, task-status tracking, and family-member embedding deletion.

The backend represents a functional academic prototype created for demonstration, evaluation, and portfolio purposes. Additional security, deployment, and scalability improvements would be required before production use.
