"""
Train Prophet forecasting models for medicine sales prediction.
"""
import pandas as pd
from prophet import Prophet
import joblib
from pathlib import Path
import sys


def train_forecast_model(medicine_name: str, data_path: Path):
    """
    Train a Prophet model for a specific medicine.
    
    Args:
        medicine_name: Name of the medicine (e.g., 'calpol')
        data_path: Path to CSV file with columns 'Date' and 'Units'
    
    Returns:
        Path to the saved model file
    """
    base_dir = Path(__file__).resolve().parent
    models_dir = base_dir / "models"
    models_dir.mkdir(exist_ok=True)
    
    print(f"Loading data from: {data_path}")
    df = pd.read_csv(data_path)
    
    # Rename columns to Prophet's expected format
    df = df.rename(columns={"Date": "ds", "Units": "y"})
    df["ds"] = pd.to_datetime(df["ds"])
    
    # Aggregate to weekly data
    df = df.resample("W", on="ds").sum().reset_index()
    
    print(f"Training Prophet model on {len(df)} weeks of data...")
    model = Prophet()
    model.fit(df)
    
    # Save the trained model
    model_path = models_dir / f"prophet_{medicine_name.lower()}_weekly.pkl"
    joblib.dump(model, model_path)
    
    print(f"✓ Model trained and saved to: {model_path}")
    return model_path


if __name__ == "__main__":
    # Example usage: python train_model.py
    base_dir = Path(__file__).resolve().parent
    
    # Train model for calpol
    data_file = base_dir / "data" / "calpol.csv"
    
    if not data_file.exists():
        print(f"ERROR: Data file not found at {data_file}")
        print("Please add a CSV file with columns: Date, Units")
        sys.exit(1)
    
    train_forecast_model("calpol", data_file)
