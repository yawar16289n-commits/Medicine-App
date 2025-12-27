# Medicine Sales Forecasting

This module provides Prophet-based time series forecasting for medicine sales.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Add historical sales data:
   - Create CSV files in `backend/forecasting/data/`
   - Format: Two columns - `Date` (YYYY-MM-DD) and `Units` (sales quantity)
   - Example: `calpol.csv`

## Usage

### Training a Model

Train a forecasting model for a medicine:

```bash
# From backend/forecasting directory
python train_model.py
```

Or via API:
```bash
POST /api/forecast/calpol/train
```

### Generating Forecasts

Via API:
```bash
# Get 4-week forecast
GET /api/forecast/calpol?periods=4

# Get forecast with plot
GET /api/forecast/calpol?periods=4&plot=true
```

Via Python:
```bash
# From backend/forecasting directory
python predict.py
```

## API Endpoints

### `GET /api/forecast/<medicine_name>`

Generate sales forecast for a medicine.

**Query Parameters:**
- `periods` (optional): Number of weeks to forecast (default: 4, max: 52)
- `plot` (optional): Generate visualization plot (true/false, default: false)

**Response:**
```json
{
  "medicine_name": "calpol",
  "periods": 4,
  "historical": [
    {"ds": "2024-01-07", "y": 850},
    {"ds": "2024-01-14", "y": 920}
  ],
  "forecast": [
    {
      "ds": "2024-04-07",
      "yhat": 1250.5,
      "yhat_lower": 1180.2,
      "yhat_upper": 1320.8
    }
  ]
}
```

### `POST /api/forecast/<medicine_name>/train`

Train a new forecasting model.

**Response:**
```json
{
  "message": "Model trained successfully for calpol",
  "model_path": "backend/forecasting/models/prophet_calpol_weekly.pkl"
}
```

## File Structure

```
backend/forecasting/
├── __init__.py
├── train_model.py      # Train new models
├── predict.py          # Generate forecasts
├── data/               # Historical sales CSV files
│   └── calpol.csv
├── models/             # Trained Prophet models
│   └── prophet_calpol_weekly.pkl
└── outputs/            # Generated plots
    └── forecast_calpol.png
```

## Data Format

CSV files must have these columns:
- `Date`: Date in YYYY-MM-DD format
- `Units`: Number of units sold

Example:
```csv
Date,Units
2024-01-01,120
2024-01-02,115
2024-01-03,125
```

## Notes

- Models aggregate data to weekly frequency
- Forecasts include confidence intervals (yhat_lower, yhat_upper)
- Models must be trained before generating forecasts
- One model per medicine
