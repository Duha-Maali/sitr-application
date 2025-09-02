from src.train import train
from src.config import Config
import pandas as pd
import matplotlib.pyplot as plt
import os
import logging
from pathlib import Path

def run_training(num_runs=4, model_name=None):
    # Set up logging to capture training output
    logging.basicConfig(level=logging.INFO, format='%(message)s')

    try:
        from src.config import Config
        Config.MODEL_NAME = model_name
        Config.MODEL_PATH = Path(f"/content/drive/MyDrive/hijab-detection/models/{model_name}/")
        Config.NUM_RUNS = num_runs
        train()
    except Exception as e:
        print(f'Training failed: {e}')

def plot_loss_curves(num_plots=4, model_name=None):

    Config.MODEL_PATH = Path(f"/content/drive/MyDrive/hijab-detection/models/{model_name}/")
    
    # Load metrics from CSV
    for run_id in range(1, num_plots+1):
        model_path = str(Config.MODEL_PATH) if isinstance(Config.MODEL_PATH, Path) else Config.MODEL_PATH
        model_path = os.path.join(model_path, f"{Config.MODEL_NAME}_run_{run_id}")
        csv_file = os.path.join(model_path, f'train_val_metrics_run_{run_id}.csv')
        if os.path.exists(csv_file):
            df = pd.read_csv(csv_file)

            # Plot loss curves
            plt.figure(figsize=(10, 6))
            plt.plot(df['epoch'], df['train_loss'], label='Training Loss')
            plt.plot(df['epoch'], df['val_loss'], label='Validation Loss')
            plt.xlabel('Epoch')
            plt.ylabel('Loss')
            plt.title(f'Training and Validation Loss Curves\n{Config.MODEL_NAME} (Run {run_id})')
            plt.legend()
            plt.grid(True)
            plt.savefig(os.path.join(model_path, f'loss_curves_{Config.MODEL_NAME}_run_{run_id}.png'))
            plt.show()

        else:
            print(f"Metrics file {csv_file} not found. Run training first.")