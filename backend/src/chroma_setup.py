from chromadb import PersistentClient

# Initialize ChromaDB client once with persistent storage
chroma_client = PersistentClient(path="C:/Users/abeda/Desktop\SITR_APP---Copy/backend/data/chroma_data")

# Get or create the collection with cosine distance
collection = chroma_client.get_or_create_collection(
    name="face_embeddings",
    metadata={"hnsw:space": "cosine"}  # Set similarity metric
)