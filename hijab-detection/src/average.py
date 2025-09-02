import pandas as pd
import os
from src.config import Config
from pathlib import Path

def compute_average_metrics(num_runs=5):
    """Compute average metrics across multiple runs and save to average_metrics.csv."""
    model_path = str(Config.MODEL_PATH) if isinstance(Config.MODEL_PATH, Path) else Config.MODEL_PATH
    output_csv = os.path.join(model_path, "average_metrics.csv")
    
    # Initialize lists to store DataFrames
    train_val_dfs = []
    test_metrics = []

    # Read training/validation metrics
    for run_id in range(1, num_runs + 1):
        csv_file = os.path.join(model_path, f"run_{run_id}", f"train_val_metrics_run_{run_id}.csv")
        if not os.path.exists(csv_file):
            raise FileNotFoundError(f"Missing {csv_file}")
        df = pd.read_csv(csv_file)
        train_val_dfs.append(df)
    
    # Ensure all runs have the same number of epochs
    max_epochs = max(df['epoch'].max() for df in train_val_dfs)
    for i, df in enumerate(train_val_dfs):
        if df['epoch'].max() < max_epochs:
            # Pad with NaN for missing epochs (e.g., early stopping)
            missing_epochs = pd.DataFrame({
                col: [float('nan')] * (max_epochs - df['epoch'].max())
                for col in df.columns
            })
            missing_epochs['epoch'] = range(df['epoch'].max() + 1, max_epochs + 1)
            train_val_dfs[i] = pd.concat([df, missing_epochs], ignore_index=True)

    # Average training/validation metrics per epoch
    train_val_avg = pd.concat(train_val_dfs).groupby('epoch').mean().reset_index()
    
    # Compute overall averages for training/validation metrics
    train_val_avg_last_row = train_val_avg.mean(numeric_only=True).to_dict()
    train_val_avg_last_row['epoch'] = 'Average'
    
    # Read test metrics
    for run_id in range(1, num_runs + 1):
        csv_file = os.path.join(model_path, f"run_{run_id}", f"test_metrics_run_{run_id}.csv")
        if not os.path.exists(csv_file):
            raise FileNotFoundError(f"Missing {csv_file}")
        df = pd.read_csv(csv_file)
        metrics = {
            'test_loss': float(df[df['Metric'] == 'Test Loss']['Value'].iloc[0]),
            'test_acc': float(df[df['Metric'] == 'Test Accuracy']['Value'].iloc[0]),
            'test_precision': float(df[df['Metric'] == 'Precision']['Value'].iloc[0]),
            'test_recall': float(df[df['Metric'] == 'Recall']['Value'].iloc[0]),
            'test_f1': float(df[df['Metric'] == 'F1-Score']['Value'].iloc[0]),
            'test_TP': int(df[df['Metric'] == 'True Positives (TP)']['Value'].iloc[0]),
            'test_TN': int(df[df['Metric'] == 'True Negatives (TN)']['Value'].iloc[0]),
            'test_FP': int(df[df['Metric'] == 'False Positives (FP)']['Value'].iloc[0]),
            'test_FN': int(df[df['Metric'] == 'False Negatives (FN)']['Value'].iloc[0]),
        }
        test_metrics.append(metrics)
    
    # Average test metrics
    test_avg = pd.DataFrame(test_metrics).mean().to_dict()
    test_avg = {f"test_{k}": v for k, v in test_avg.items()}
    
    # Combine into final DataFrame
    final_df = train_val_avg.copy()
    final_df = pd.concat([final_df, pd.DataFrame([train_val_avg_last_row])], ignore_index=True)
    
    # Add test metrics as additional rows
    test_rows = [{'epoch': k, **{col: test_avg[k] if col in test_avg else float('nan') for col in final_df.columns if col != 'epoch'}} for k in test_avg.keys()]
    final_df = pd.concat([final_df, pd.DataFrame(test_rows)], ignore_index=True)
    
    # Save to CSV
    final_df.to_csv(output_csv, index=False)
    print(f"Saved average metrics to {output_csv}")

if __name__ == "__main__":
    compute_average_metrics()