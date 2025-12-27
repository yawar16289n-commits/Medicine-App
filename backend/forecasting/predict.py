"""
Generate sales forecasts using trained Prophet models.
"""
import pandas as pd
import joblib
from pathlib import Path
import sys


def generate_forecast(medicine_name: str, data_path: Path, periods: int = 4):
    """
    Generate forecast for a medicine using a trained Prophet model.
    
    Args:
        medicine_name: Name of the medicine (e.g., 'calpol')
        data_path: Path to historical sales CSV with columns 'Date' and 'Units'
        periods: Number of weeks to forecast (default: 4)
    
    Returns:
        Dictionary with historical data and forecast predictions
    """
    base_dir = Path(__file__).resolve().parent
    models_path = base_dir / "models" / f"prophet_{medicine_name.lower()}_weekly.pkl"
    
    # Check if model exists
    if not models_path.exists():
        raise FileNotFoundError(f"Model not found: {models_path}. Please train the model first.")
    
    # Check if data file exists
    if not data_path.exists():
        raise FileNotFoundError(f"Data file not found: {data_path}")
    
    # Load and process historical data
    print(f"Loading data from: {data_path}")
    df = pd.read_csv(data_path)
    df = df.rename(columns={"Date": "ds", "Units": "y"})
    df["ds"] = pd.to_datetime(df["ds"], errors='coerce')
    df = df.dropna(subset=["ds", "y"])
    
    # Aggregate to weekly data
    df = df.resample("W", on="ds").sum().reset_index()
    
    # Load the trained model
    print(f"Loading Prophet model from: {models_path}")
    model = joblib.load(models_path)
    
    # Generate forecast
    future = model.make_future_dataframe(periods=periods, freq="W")
    forecast = model.predict(future)
    
    # Extract only future predictions
    future_forecast = forecast.tail(periods)
    
    # Return data in JSON-friendly format
    return {
        "medicine_name": medicine_name,
        "periods": periods,
        "historical": df.to_dict(orient="records"),
        "forecast": future_forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].to_dict(orient="records")
    }


def generate_forecast_plot(medicine_name: str, data_path: Path, periods: int = 4):
    """
    Generate forecast with visualization plot.
    
    Args:
        medicine_name: Name of the medicine
        data_path: Path to historical sales CSV
        periods: Number of weeks to forecast
    
    Returns:
        Tuple of (forecast_data, plot_path)
    """
    import matplotlib.pyplot as plt
    
    base_dir = Path(__file__).resolve().parent
    models_path = base_dir / "models" / f"prophet_{medicine_name.lower()}_weekly.pkl"
    outputs_dir = base_dir / "outputs"
    outputs_dir.mkdir(exist_ok=True)
    
    # Load data
    df = pd.read_csv(data_path)
    df = df.rename(columns={"Date": "ds", "Units": "y"})
    df["ds"] = pd.to_datetime(df["ds"], errors='coerce')
    df = df.dropna(subset=["ds", "y"])
    df = df.resample("W", on="ds").sum().reset_index()
    
    # Load model and generate forecast
    model = joblib.load(models_path)
    future = model.make_future_dataframe(periods=periods, freq="W")
    forecast = model.predict(future)
    
    # Create plot
    plt.figure(figsize=(10, 6))
    plt.plot(df["ds"], df["y"], label="Actual Sales", marker="o")
    plt.plot(forecast["ds"], forecast["yhat"], label="Forecast", linestyle="--")
    plt.fill_between(forecast["ds"], forecast["yhat_lower"], forecast["yhat_upper"],
                     alpha=0.2, label="Confidence Interval")
    plt.title(f"{medicine_name.title()} Weekly Sales Forecast (Next {periods} Weeks)")
    plt.xlabel("Date")
    plt.ylabel("Units Sold")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    
    plot_path = outputs_dir / f"forecast_{medicine_name.lower()}.png"
    plt.savefig(plot_path)
    plt.close()
    
    print(f"✓ Forecast plot saved to: {plot_path}")
    
    # Return forecast data
    return generate_forecast(medicine_name, data_path, periods), plot_path


if __name__ == "__main__":
    # Example usage: python predict.py
    base_dir = Path(__file__).resolve().parent
    data_file = base_dir / "data" / "calpol.csv"
    
    if not data_file.exists():
        print(f"ERROR: Data file not found at {data_file}")
        sys.exit(1)
    
    result, plot_path = generate_forecast_plot("calpol", data_file, periods=4)
    print(f"\nForecast for next {result['periods']} weeks:")
    for item in result['forecast']:
        print(f"  {item['ds']}: {item['yhat']:.1f} units (range: {item['yhat_lower']:.1f}-{item['yhat_upper']:.1f})")
