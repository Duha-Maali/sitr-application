# evaluate.py
import torch
from torch.nn import BCEWithLogitsLoss
from src.config import Config
from src.model import build_model
from src.dataset import get_dataloaders
from src.utils import load_checkpoint, validate
from sklearn.metrics import precision_recall_fscore_support
from pathlib import Path
import os
import time
import csv

def evaluate(run_id=None):
    """Evaluate the trained model on the test set."""
    
    start_time = time.time()
    
    try:
        # Validate config
        from src.train import validate_config
        model_path = validate_config(run_id)

        # Initialize model and load best checkpoint
        model = build_model()
        # Convert MODEL_PATH to str if Path object
        # model_path = str(Config.MODEL_PATH) if isinstance(Config.MODEL_PATH, Path) else Config.MODEL_PATH
        best_model_path = os.path.join(model_path, "best_model.pt")
        model = load_checkpoint(model, best_model_path)
        model.eval()

        # Load test data
        try:
            _, _, test_loader = get_dataloaders()
            if test_loader is None:
                raise ValueError("Test loader is not provided by get_dataloaders()")
        except Exception as e:
            raise RuntimeError(f"Failed to load test data: {e}")

        # Evaluation
        criterion = BCEWithLogitsLoss()
        test_metrics = validate(model, test_loader, criterion, dataset_name=f"Test Run {run_id}")
        test_loss, test_acc, test_precision, test_recall, test_f1, test_TP, test_TN, test_FP, test_FN = test_metrics

        # Calculate and print testing time
        end_time = time.time()
        testing_time = end_time - start_time
        print(f"Testing time: {testing_time:.2f} seconds")
        
        # Log metrics to CSV
        csv_file = os.path.join(model_path, f"test_metrics_run_{run_id}.csv")
        csv_headers = [
            "test_loss", "test_accuracy", "test_precision", "test_recall", "test_f1",
            "test_TP", "test_TN", "test_FP", "test_FN"
        ]

        csv_data = [{
            "test_loss": test_loss,
            "test_accuracy": test_acc,
            "test_precision": test_precision,
            "test_recall": test_recall,
            "test_f1": test_f1
        }]
        with open(csv_file, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=csv_headers)
            writer.writeheader()
            writer.writerows(csv_data)
        print(f"Saved test metrics to {csv_file}")

        # Report results
        print(f"Test Results:")
        print(f"Loss: {test_loss:.4f}, Accuracy: {test_acc:.4f}, F1-Score: {test_f1:.4f}")

        return test_metrics

    except Exception as e:
        print(f"Testing failed: {e}")
        raise

if __name__ == "__main__":
    evaluate()