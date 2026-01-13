# Quick Reference: Populate Forecasts Script

## Quick Commands

```bash
# Navigate to backend folder
cd backend

# Test without making changes (recommended first run)
python populate_forecasts.py --dry-run

# Populate forecasts with default settings (30 days)
python populate_forecasts.py

# Populate 60 days of forecasts
python populate_forecasts.py --days 60

# Use different API URL
python populate_forecasts.py --api-url http://localhost:8000

# Verbose output for debugging
python populate_forecasts.py --verbose --dry-run

# Windows: Use batch file
run_populate_forecasts.bat

# Linux/Mac: Use shell script
./run_populate_forecasts.sh
```

## What It Does

1. ✅ Reads all district-medicine combinations from `district_medicine_lookup` table
2. ✅ Calls external Prophet API for each combination (district + medicine name)
3. ✅ Saves forecasts to `medicine_forecast` table for each specific medicine
4. ✅ Handles errors gracefully with detailed logging

## Prerequisites

- ✅ External Prophet API running (default: http://127.0.0.1:5000)
- ✅ `district_medicine_lookup` table populated (auto-managed by sales)
- ✅ Python environment with dependencies installed

## Example Output

```
======================================================================
POPULATE MEDICINE FORECASTS FROM PROPHET API
======================================================================
API URL: http://127.0.0.1:5000
Forecast days: 30
Mode: LIVE (will save to database)
======================================================================

Step 1: Fetching district-medicine combinations from lookup table...
Found 8 unique district-medicine combinations

[1/8] Processing: Karachi - Panadol (Paracetamol)
  Calling API: http://127.0.0.1:5000/forecast
  Params: {'area': 'Karachi', 'medicine': 'Panadol', 'days': 30}
  ✅ Received 30 forecast data points
  ✅ Saved 30 forecast records

[2/8] Processing: Karachi - Calpol (Paracetamol)
  Calling API: http://127.0.0.1:5000/forecast
  Params: {'area': 'Karachi', 'medicine': 'Calpol', 'days': 30}
  ✅ Received 30 forecast data points
  ✅ Saved 30 forecast records

[3/8] Processing: Lahore - Advil (Ibuprofen)
  Calling API: http://127.0.0.1:5000/forecast
  Params: {'area': 'Lahore', 'medicine': 'Advil', 'days': 30}
  ✅ Received 30 forecast data points
  ✅ Saved 30 forecast records

...

======================================================================
SUMMARY
======================================================================
Total combinations processed: 8
Successful: 8
Failed: 0
Total forecast records saved: 240
```

## Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot connect to API" | Start Prophet API service at http://127.0.0.1:5000 |
| "No combinations found" | Create sales records to populate lookup table |
| "All values are null/NaN" | Retrain Prophet models with better data |
| "ModuleNotFoundError" | Activate virtual environment and install dependencies |

## Verification Queries

```sql
-- Check how many forecasts were created
SELECT COUNT(*) FROM medicine_forecast 
WHERE model_version = 'prophet_external_v1';

-- View forecast coverage by district
SELECT d.name, COUNT(DISTINCT mf.forecast_date) AS days_forecasted
FROM medicine_forecast mf
JOIN district d ON mf.district_id = d.id
WHERE mf.model_version = 'prophet_external_v1'
GROUP BY d.name;

-- Check latest forecasts
SELECT * FROM medicine_forecast 
WHERE model_version = 'prophet_external_v1'
ORDER BY created_at DESC LIMIT 10;
```

## Automation

### Windows Task Scheduler
```
Program: D:\Medicine-App-main\backend\run_populate_forecasts.bat
Trigger: Daily at 2:00 AM
```

### Linux Cron
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backend/run_populate_forecasts.sh >> /var/log/forecast.log 2>&1
```

## Files Created

- `populate_forecasts.py` - Main script
- `run_populate_forecasts.bat` - Windows wrapper
- `run_populate_forecasts.sh` - Linux/Mac wrapper
- `POPULATE_FORECASTS_README.md` - Full documentation

## Integration with Existing System

The script complements the existing forecast module:
- **Manual API**: `POST /api/forecast/prophet/fetch` - One combination at a time
- **This Script**: Processes ALL combinations automatically

Both save to the same `medicine_forecast` table.

## Next Steps

1. Test with dry-run: `python populate_forecasts.py --dry-run`
2. Run once manually: `python populate_forecasts.py`
3. Verify results in database
4. Set up scheduled task for automatic updates
