# Medicine Forecast Integration

## Overview
Successfully integrated medicine demand forecasting by area (district) and formula into the existing Medicine-App.

## What Was Added

### Backend API Endpoint
**New Route:** `GET /api/forecast`

**Query Parameters:**
- `area` (required): District name (e.g., "Bahadurabad")
- `formula` (required): Formula name (e.g., "Acetylsalicylic_Acid")
- `days` (required): Number of days to forecast (1-365)

**Example Request:**
```
GET http://127.0.0.1:5000/api/forecast?area=Bahadurabad&formula=Acetylsalicylic_Acid&days=30
```

**Response Structure:**
```json
{
  "area": "Bahadurabad",
  "formula": "Acetylsalicylic Acid",
  "days": 30,
  "medicines_count": 3,
  "medicines": ["Brand1", "Brand2", "Brand3"],
  "historical_data": [
    {
      "date": "2025-11-20",
      "quantity": 150
    }
  ],
  "forecast": [
    {
      "date": "2025-12-21",
      "predicted_quantity": 145,
      "source": "calculated"
    }
  ],
  "summary": {
    "total_forecast": 4350,
    "avg_daily": 145.0,
    "forecast_start": "2025-12-21",
    "forecast_end": "2026-01-19"
  }
}
```

### Frontend Integration

**File:** `Frontend/src/pages/ForecastPage.jsx`

**New Features:**
1. **Dynamic Filters:**
   - Area/District dropdown (pulls from `/api/districts`)
   - Medicine Formula dropdown (pulls from `/api/formulas`)
   - Forecast Period selector (7, 14, 30, 60, 90 days)

2. **Real-time Updates:**
   - Forecast automatically refreshes when filters change
   - Date range display updates based on selection
   - Summary statistics recalculate

3. **API Client Update:**
   - Added `forecastAPI.getAreaFormulaForecast(params)` to `Frontend/src/utils/api.js`

## How It Works

### Data Flow
1. **User Selection:** User selects area, formula, and time period via dropdowns
2. **API Call:** Frontend calls `GET /api/forecast` with selected parameters
3. **Backend Processing:**
   - Looks up district and formula in database
   - Finds all medicines matching the formula
   - Aggregates historical sales data (last 90 days)
   - Checks for stored forecasts in `MedicineForecast` table
   - If no stored forecasts, generates simple moving average forecast with trend detection
4. **Response:** Returns historical data + forecast predictions
5. **Display:** Frontend transforms data and renders in existing UI components

### Forecasting Logic
The endpoint uses a simple forecasting algorithm when no stored forecasts exist:
- **Historical Average:** Calculates average daily sales from last 90 days
- **Trend Detection:** If ≥7 days of data, applies trend factor based on recent week
- **Projection:** Applies trend to historical average for future predictions

For production use, you can:
- Pre-populate the `MedicineForecast` table with Prophet/ARIMA predictions
- The endpoint will use stored forecasts if available
- Set `model_version` field to track which algorithm generated the forecast

## Testing

### Prerequisites
1. Ensure you have districts in the database:
   ```sql
   INSERT INTO district (name, area_code) VALUES ('Bahadurabad', 'BHD01');
   ```

2. Ensure you have formulas:
   ```sql
   INSERT INTO formula (name) VALUES ('Acetylsalicylic Acid');
   ```

3. Add medicines with sales data:
   ```sql
   INSERT INTO medicine (formula_id, brand_name, medicine_id) 
   VALUES (1, 'Aspirin', 'ASP001');
   
   INSERT INTO medicine_sales (medicine_id, district_id, date, quantity)
   VALUES (1, 1, '2025-12-01', 150);
   ```

### Manual Test
1. Start backend: `python backend/app.py`
2. Visit: `http://127.0.0.1:5000/api/forecast?area=Bahadurabad&formula=Acetylsalicylic_Acid&days=30`
3. Should return JSON with forecast data

### Frontend Test
1. Start frontend: `cd Frontend && npm run dev`
2. Navigate to Forecast page
3. Select area, formula, and days from dropdowns
4. Verify forecast data loads and displays

## Database Schema Used

### Tables
- `district` - Areas/districts
- `formula` - Medicine formulas (active ingredients)
- `medicine` - Individual medicine products
- `medicine_sales` - Historical sales records
- `medicine_forecast` - Pre-computed forecast predictions (optional)

### Relationships
```
District ─┬─> MedicineSales
          └─> MedicineForecast
          
Formula ──> Medicine ─┬─> MedicineSales
                      └─> MedicineForecast
```

## Future Enhancements

1. **Advanced Forecasting:**
   - Integrate Prophet/ARIMA models
   - Store predictions in `MedicineForecast` table
   - Add confidence intervals (yhat_lower, yhat_upper)

2. **Visualization:**
   - Add charts showing historical vs forecast trends
   - Display prediction confidence bands
   - Show formula comparison graphs

3. **Performance:**
   - Cache frequently requested forecasts
   - Pre-compute common forecast periods
   - Add background job to refresh forecasts nightly

4. **Features:**
   - Export forecast to Excel/CSV
   - Email forecast reports
   - Set alert thresholds for demand spikes

## Files Modified

### Backend
- `backend/routes/forecast.py` - Added `/forecast` endpoint
- `backend/models.py` - Uses existing `MedicineSales`, `MedicineForecast` models

### Frontend
- `Frontend/src/pages/ForecastPage.jsx` - Added filters and API integration
- `Frontend/src/utils/api.js` - Added `getAreaFormulaForecast()` method

## Notes
- The endpoint gracefully falls back to calculated forecasts if no stored predictions exist
- Historical data window is 90 days (configurable in code)
- Trend detection requires minimum 7 days of sales data
- Formula names are normalized (underscores ↔ spaces) for flexible matching
- District names are case-insensitive in lookups
