# inference.py
import torch
from PIL import Image
import os
from torchvision import transforms
from src.config import Config
from src.model import build_model
from src.utils import load_checkpoint

def preprocess_image(image_path):
    """Preprocess an image for model input."""
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0)
    return image

def predict_single_image(model, image_path):
    """Predict hijab presence for a single image."""
    try:
        model.eval()
        image = preprocess_image(image_path)
        image = image.to(Config.DEVICE)
        with torch.no_grad():
            output = model(image)
            prob = torch.sigmoid(output).item()
            prediction = "Hijab" if prob > 0.5 else "No Hijab"
            confidence = prob if prob > 0.5 else 1 - prob
        return {
            "image": os.path.basename(image_path),
            "prediction": prediction,
            "confidence": confidence,
            "probability": prob
        }
    except Exception as e:
        print(f"Error predicting {image_path}: {e}")
        return None

def predict_batch_images(model, image_dir):
    """Predict hijab presence for all images in a directory."""
    results = []
    if not os.path.isdir(image_dir):
        raise ValueError(f"Directory not found: {image_dir}")
    image_extensions = (".jpg", ".jpeg", ".png")
    for fname in os.listdir(image_dir):
        if fname.lower().endswith(image_extensions):
            image_path = os.path.join(image_dir, fname)
            result = predict_single_image(model, image_path)
            if result:
                results.append(result)
    return results

def main(image_path=None, image_dir=None):
    """Run inference on a single image or directory of images."""
    try:
        model = build_model()
        checkpoint_path = os.path.join(Config.MODEL_PATH, "best_model.pt")
        model = load_checkpoint(model, checkpoint_path)
        if image_path:
            result = predict_single_image(model, image_path)
            if result:
                print(f"Image: {result['image']}")
                print(f"Prediction: {result['prediction']}")
                print(f"Confidence: {result['confidence']:.4f}")
                print(f"Probability: {result['probability']:.4f}")
        elif image_dir:
            results = predict_batch_images(model, image_dir)
            for result in results:
                print(f"Image: {result['image']}")
                print(f"Prediction: {result['prediction']}")
                print(f"Confidence: {result['confidence']:.4f}")
                print(f"Probability: {result['probability']:.4f}")
        else:
            print("Please provide an image path or directory.")
    except Exception as e:
        print(f"Inference failed: {e}")
    return None

if __name__ == "__main__":
    main(image_path="/content/drive/MyDrive/hijab-detection/hijabigirl.jpg")
    # main(image_dir="path/to/image_folder/")
    