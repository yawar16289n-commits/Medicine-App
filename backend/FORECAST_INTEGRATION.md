# Prophet Forecast Integration

## Overview
This integration fetches forecast data from an external Prophet API and stores it in the `medicine_forecast` table.

## Workflow

```
External Prophet API → Fetch & Save → Database → Display to Users
```

## API Endpoints

### 1. Fetch and Save Forecast (POST)
**Endpoint:** `POST /api/forecast/prophet/fetch`

**Purpose:** Fetch forecast from external Prophet API and save to database

**Request Body:**
```json
{
  "area": "Bahadurabad",
  "formula": "Paracetamol",
  "days": 30,
  "api_url": "http://127.0.0.1:5000"
}
```

**Response:**
```json
{
  "message": "Forecast data saved successfully",
  "area": "Bahadurabad",
  "formula": "Paracetamol",
  "medicines_count": 3,
  "forecasts_saved": 90,
  "days": 30,
  "total_quantity": 450
}
```

---

### 2. Get Forecast from Database (GET)
**Endpoint:** `GET /api/forecast/prophet?area=Bahadurabad&formula=Paracetamol&days=30`

**Purpose:** Retrieve previously saved forecast data from database

**Response:**
```json
{
  "message": "You need 450 units of Paracetamol in Bahadurabad for the next 30 days",
  "area": "Bahadurabad",
  "formula": "Paracetamol",
  "total_quantity": 450,
  "forecast": {
    "dates": ["2026-01-06", "2026-01-07", ...],
    "values": [15, 14, 16, ...]
  },
  "source": "database",
  "medicines_count": 3
}
```

## Usage Flow

1. **First time:** Use POST to fetch and save
   ```bash
   POST /api/forecast/prophet/fetch
   ```

2. **Subsequent requests:** Use GET to retrieve from database
   ```bash
   GET /api/forecast/prophet?area=Bahadurabad&formula=Paracetamol&days=30
   ```

3. **Update forecasts:** Call POST again to refresh data

## Testing

Run the test script:
```bash
python backend/test_forecast_integration.py
```

## Database Table

Forecasts are stored in `medicine_forecast` table:
- `medicine_id`: Medicine reference
- `district_id`: District reference
- `forecast_date`: Date of forecast
- `forecasted_quantity`: Predicted quantity
- `model_version`: 'prophet_external_v1'

## Notes

- External Prophet API must be running at specified `api_url`
- Districts and formulas must exist in database
- Forecasts are aggregated across all medicines with same formula
- Duplicate forecasts are updated, not duplicated
