# train.py
import torch
from torch.optim import Adam
from torch.nn import BCEWithLogitsLoss
from torch.amp import GradScaler, autocast
from torch.optim.lr_scheduler import ReduceLROnPlateau
from src.config import Config
from src.model import build_model
from src.dataset import get_dataloaders
from src.utils import save_checkpoint, validate
from src.evaluate import evaluate
from pathlib import Path
import os
import time
import csv
import numpy as np
from sklearn.metrics import precision_recall_fscore_support, confusion_matrix

def validate_config(run_id=None):
    """Validate Config attributes."""
    required_attrs = {
        "LEARNING_RATE": float,
        "WEIGHT_DECAY": float,
        "EPOCHS": int,
        "DEVICE": torch.device,
        "MODEL_PATH": (str, Path),
        "DATA_DIR": (str, Path),
    }
    for attr, expected_type in required_attrs.items():
        if not hasattr(Config, attr):
            raise AttributeError(f"Config missing required attribute: {attr}")
        value = getattr(Config, attr)
        if not isinstance(value, expected_type):
            raise TypeError(f"Config.{attr} must be {expected_type}, got {type(value)}")
    model_path = str(Config.MODEL_PATH) if isinstance(Config.MODEL_PATH, Path) else Config.MODEL_PATH
    if run_id:
        model_path = os.path.join(model_path, f"{Config.MODEL_NAME}_run_{run_id}")
    if not os.path.isdir(model_path):
        os.makedirs(model_path, exist_ok=True)
        print(f"Created directory: {model_path}")
    # I'm using AMP so I'll check for CUDA
    if Config.DEVICE.type == "cuda" and not torch.cuda.is_available():
        raise RuntimeError("CUDA device specified but not available")
    return model_path

def train():
    """Train the model."""
    
    num_runs = Config.NUM_RUNS
    for run_id in range(1, num_runs+1):
        print(f"Starting run {run_id}/{num_runs}")
        start_time = time.time()
    
        # Initialize CSV file
        model_path = validate_config(run_id)
        csv_file = os.path.join(model_path, f"train_val_metrics_run_{run_id}.csv")
        csv_headers = [
                "epoch", "learning_rate", "train_loss", "train_acc", "train_precision", "train_recall", "train_fscore",
                "val_loss", "val_acc", "val_precision", "val_recall", "val_fscore", 
                "train_TP", "train_TN", "train_FP", "train_FN", "val_TP", "val_TN", "val_FP", "val_FN"
        ]
        
        csv_rows = []
        
        try:
            # Initialize model, data, and optimizer
            model = build_model()
            try:
                train_loader, val_loader, _ = get_dataloaders()
            except Exception as e:
                raise RuntimeError(f"Failed to load data: {e}")

            optimizer = Adam(model.parameters(), lr=Config.LEARNING_RATE, weight_decay=Config.WEIGHT_DECAY)
            criterion = BCEWithLogitsLoss()
            scaler = GradScaler('cuda')
            
            # Added learning rate scheduler: ReduceLROnPlateau
            # Reduces learning rate when validation loss plateaus
            # factor=0.1: reduces lr by 10x; patience=3: waits 3 epochs; min_lr: prevents lr from going too low
            # scheduler = ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=3, min_lr=1e-6, verbose=True)
            
            best_val_loss = float("inf")
            patience = 5
            patience_counter = 0

            for epoch in range(Config.EPOCHS):
                model.train()
                train_loss = 0.
                train_correct = 0
                train_total = 0
                train_TP = 0
                train_TN = 0
                train_FP = 0
                train_FN = 0
                all_train_preds = []
                all_train_labels = []
                
                try:
                    for images, labels in train_loader:
                        images = images.to(Config.DEVICE)
                        labels = labels.to(Config.DEVICE).float().view(-1, 1)

                        # Mixed precision training
                        with autocast('cuda'):
                            outputs = model(images)
                            loss = criterion(outputs, labels)
                        train_loss += loss.item() * images.size(0)
                        
                        preds = torch.sigmoid(outputs) > 0.5
                        train_correct += (preds == labels).sum().item()
                        train_total += labels.size(0)
                        batch_preds = preds.cpu().numpy().flatten()
                        batch_labels = labels.cpu().numpy().flatten()
                        cm = confusion_matrix(batch_labels, batch_preds)
                        TN, FP, FN, TP = cm.ravel() if cm.size == 4 else (0, 0, 0, 0)
                        train_TP += TP
                        train_TN += TN
                        train_FP += FP
                        train_FN += FN
                        all_train_preds.extend(batch_preds)
                        all_train_labels.extend(batch_labels)
                        
                        # Backpropagation with mixed precision
                        optimizer.zero_grad()
                        scaler.scale(loss).backward()
                        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                        scaler.step(optimizer)  # Update weights
                        scaler.update()  # Update the scale for next iteration
                except Exception as e:
                    raise RuntimeError(f"Training failed at epoch {epoch}: {e}")

                avg_train_loss = train_loss / train_total
                train_acc = train_correct / train_total if train_total > 0 else 0.0
                train_precision, train_recall, train_f1, _ = precision_recall_fscore_support(
                    all_train_labels, all_train_preds, average='binary', zero_division=0
                )
                current_lr = optimizer.param_groups[0]['lr']
                print(f"Epoch {epoch+1}/{Config.EPOCHS}")
                print("Train Results:")
                print(f"Loss: {avg_train_loss:.4f}, Accuracy: {train_acc:.4f}, F1: {train_f1:.4f}")
                
                # Validation
                val_metrics = validate(model, val_loader, criterion, dataset_name=f"Validation Run {run_id}")
                val_loss, val_acc, val_precision, val_recall, val_f1, val_TP, val_TN, val_FP, val_FN = val_metrics
                print("Val Results:")
                print(f"Loss: {val_loss:.4f}, Accuracy: {val_acc:.4f}, F1: {val_f1:.4f}")
                # Added scheduler step: updates learning rate based on validation loss
                # Must be called after validation to use the latest val_loss
                # scheduler.step(val_loss)
                
                # Save metrics
                csv_rows.append({
                    "epoch": epoch + 1,
                    "learning_rate": current_lr,
                    "train_loss": avg_train_loss,
                    "train_acc": train_acc,
                    "train_precision": train_precision,
                    "train_recall": train_recall,
                    "train_fscore": train_f1,
                    "val_loss": val_loss,
                    "val_acc": val_acc,
                    "val_precision": val_precision,
                    "val_recall": val_recall,
                    "val_fscore": val_f1,
                    "train_TP": train_TP,
                    "train_TN": train_TN,
                    "train_FP": train_FP,
                    "train_FN": train_FN,
                    "val_TP": val_TP,
                    "val_TN": val_TN,
                    "val_FP": val_FP,
                    "val_FN": val_FN    
                })
                    
                if val_loss < best_val_loss:
                    best_val_loss = val_loss
                    patience_counter = 0
                    save_checkpoint(model, optimizer, epoch, is_best=True, run_id=run_id)
                else:
                    patience_counter += 1
                    save_checkpoint(model, optimizer, epoch, is_best=False, run_id=run_id)

                if patience_counter >= patience:
                    print("Early stopping triggered")
                    break
            
            # Calculate and print training time
            end_time = time.time()
            training_time = end_time - start_time
            print(f"Training time: {training_time:.2f} seconds")

            # Log metrics to CSV
            file_exists = os.path.exists(csv_file)
            with open(csv_file, 'a', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=csv_headers)
                if not file_exists:
                    writer.writeheader()
                for row in csv_rows:
                    writer.writerow(row)
            print(f"Run {run_id}: Metrics saved to {csv_file}")
            
        except Exception as e:
            print(f"Training terminated due to error: {e}")
            raise
        
        # Run evaluation for this run
        print(f"Run {run_id}: Starting evaluation")
        evaluate(run_id=run_id)
        print(f"Run {run_id}: Evaluation completed")    
    

if __name__ == "__main__":
    train()