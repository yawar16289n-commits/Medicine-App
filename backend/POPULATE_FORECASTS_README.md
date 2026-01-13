# Automatic Forecast Population from External Prophet API

This module provides scripts to automatically populate the `medicine_forecast` table by fetching predictions from an external Prophet forecasting API based on the `district_medicine_lookup` table.

## Overview

The system works in these steps:
1. **Read** all unique district-medicine combinations from `district_medicine_lookup` table
2. **Fetch** forecast predictions from external Prophet API for each combination (district + medicine name)
3. **Save** the forecast data to `medicine_forecast` table for that specific medicine

## Files

- **`populate_forecasts.py`** - Main Python script with full CLI interface
- **`run_populate_forecasts.bat`** - Windows batch file wrapper
- **`run_populate_forecasts.sh`** - Linux/Mac shell script wrapper
- **`POPULATE_FORECASTS_README.md`** - This documentation file

## Quick Start

### Windows

```powershell
# Navigate to backend folder
cd backend

# Run with default settings (30 days, local API)
python populate_forecasts.py

# Or use the batch file
run_populate_forecasts.bat
```

### Linux/Mac

```bash
# Navigate to backend folder
cd backend

# Make shell script executable (first time only)
chmod +x run_populate_forecasts.sh

# Run with default settings
./run_populate_forecasts.sh
```

## Command-Line Options

```bash
python populate_forecasts.py [OPTIONS]

Options:
  --api-url URL      External Prophet API URL
                     Default: http://127.0.0.1:5000
  
  --days DAYS        Number of days to forecast (1-365)
                     Default: 30
  
  --dry-run          Show what would be done without saving to database
                     Use this to test before making changes
  
  --verbose          Show detailed progress information
                     Useful for debugging
  
  --help, -h         Show help message and exit
```

## Usage Examples

### Example 1: Dry Run (Test Without Saving)

```bash
# See what would happen without making changes
python populate_forecasts.py --dry-run
```

Output:
```
======================================================================
POPULATE MEDICINE FORECASTS FROM PROPHET API
======================================================================
API URL: http://127.0.0.1:5000
Forecast days: 30
Mode: DRY RUN (no changes)
======================================================================

Step 1: Fetching district-medicine combinations from lookup table...
Found 5 unique district-medicine combinations

[1/5] Processing: Karachi - Panadol (Paracetamol)
  Calling API: http://127.0.0.1:5000/forecast
  Params: {'area': 'Karachi', 'formula': 'Paracetamol', 'days': 30}
  ✅ Received 30 forecast data points
  [DRY RUN] Would save 30 forecast records

...
```

### Example 2: Populate with Default Settings

```bash
# Populate 30 days of forecasts
python populate_forecasts.py
```

### Example 3: Custom Days and API URL

```bash
# Populate 60 days using a different API server
python populate_forecasts.py --days 60 --api-url http://localhost:8000
```

### Example 4: Verbose Mode for Debugging

```bash
# Show detailed information including medicine IDs
python populate_forecasts.py --verbose
```

## Requirements

### 1. External Prophet API Running

The external Prophet forecasting service must be running and accessible. Default: `http://127.0.0.1:5000`

**Expected API Endpoint:**
```
GET /forecast?area=<district>&medicine=<medicine_name>&days=<days>

Response:
{
  "forecast": {
    "dates": ["2026-01-13", "2026-01-14", ...],
    "values": [150.5, 165.3, ...]
  },
  "total_quantity": 4500
}
```

### 2. Populated Lookup Table

The `district_medicine_lookup` table must have entries. This is automatically managed by sales operations (see `DISTRICT_LOOKUP_AUTO_MANAGEMENT.md`).

Check if lookup table has data:
```sql
SELECT COUNT(*) FROM district_medicine_lookup;
```

If empty, create some sales records first, or populate manually:
```sql
INSERT INTO district_medicine_lookup (district_id, medicine_id, formula_id)
SELECT DISTINCT ms.district_id, ms.medicine_id, m.formula_id
FROM medicine_sales ms
JOIN medicine m ON ms.medicine_id = m.id;
```

### 3. Python Dependencies

Required packages (already in `requirements.txt`):
- Flask
- SQLAlchemy
- requests

## How It Works

### Step-by-Step Process

1. **Query Lookup Table**
   ```python
   # Get all unique district-medicine pairs
   SELECT DISTINCT district_id, medicine_id 
   FROM district_medicine_lookup
   ```

2. **For Each Combination**
   - Get district name and medicine brand name
   - Call external Prophet API with district and medicine name
   - Parse forecast response
   - Save forecast for this specific medicine

3. **Save to Database**
   ```python
   # For each date in forecast:
   INSERT INTO medicine_forecast (
     medicine_id, district_id, forecast_date,
     forecasted_quantity, model_version
   ) VALUES (...)
   ON DUPLICATE KEY UPDATE forecasted_quantity=...
   ```

### Forecast Distribution Logic

Each district-medicine combination gets its own forecast from the API:
- **Lookup table has**: District-Medicine-Formula triplets
- **Script processes**: Each district-medicine pair individually
- **API called with**: District name + Medicine brand name
- **Result saved to**: That specific medicine in that district

Example:
- Lookup: (Karachi, Panadol, Paracetamol) → API call: Karachi + Panadol → Save to Panadol
- Lookup: (Karachi, Calpol, Paracetamol) → API call: Karachi + Calpol → Save to Calpol
- Each medicine gets its own specific forecast based on its historical sales in that district

## Scheduling

### Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., daily at 2 AM)
4. Action: Start a program
   - Program: `D:\Medicine-App-main\backend\run_populate_forecasts.bat`
5. Save

### Linux Cron Job

```bash
# Edit crontab
crontab -e

# Add line to run daily at 2 AM
0 2 * * * /path/to/Medicine-App-main/backend/run_populate_forecasts.sh >> /var/log/forecast_populate.log 2>&1
```

### Python Script (Advanced)

Create a scheduled task using Python:

```python
import schedule
import time
from populate_forecasts import populate_all_forecasts
from app import create_app

def job():
    app = create_app()
    with app.app_context():
        populate_all_forecasts(
            api_url='http://127.0.0.1:5000',
            days=30,
            dry_run=False
        )

# Run every day at 2:00 AM
schedule.every().day.at("02:00").do(job)

while True:
    schedule.run_pending()
    time.sleep(60)
```

## Troubleshooting

### Error: "Cannot connect to API"

**Problem:** External Prophet API is not running

**Solution:**
1. Start the Prophet API service
2. Verify it's accessible: `curl http://127.0.0.1:5000/forecast?area=Test&formula=Test&days=1`
3. Check firewall/network settings

### Error: "No combinations found in lookup table"

**Problem:** `district_medicine_lookup` table is empty

**Solution:**
1. Create some sales records (this auto-populates lookup table)
2. Or manually populate lookup table with SQL:
   ```sql
   INSERT INTO district_medicine_lookup (district_id, medicine_id, formula_id)
   SELECT DISTINCT ms.district_id, ms.medicine_id, m.formula_id
   FROM medicine_sales ms
   JOIN medicine m ON ms.medicine_id = m.id;
   ```

### Error: "All forecast values are null/NaN"

**Problem:** Prophet model returned invalid predictions

**Solution:**
1. Check Prophet API logs for model errors
2. Retrain Prophet models with more/better data
3. Verify historical sales data quality

### Error: "ModuleNotFoundError"

**Problem:** Virtual environment not activated or dependencies not installed

**Solution:**
```bash
# Activate virtual environment
cd Medicine-App-main
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r backend/requirements.txt
```

### Slow Performance

**Problem:** Many combinations × many days = many API calls

**Optimization:**
- Run during off-hours (scheduled at night)
- Reduce `--days` parameter (e.g., 30 instead of 365)
- Batch process: process subsets of combinations
- Cache API responses temporarily

## Database Schema

### Input: district_medicine_lookup
```sql
CREATE TABLE district_medicine_lookup (
  id INT PRIMARY KEY AUTO_INCREMENT,
  district_id INT NOT NULL,
  medicine_id INT NOT NULL,
  formula_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (district_id, medicine_id, formula_id)
);
```

### Output: medicine_forecast
```sql
CREATE TABLE medicine_forecast (
  id INT PRIMARY KEY AUTO_INCREMENT,
  medicine_id INT NOT NULL,
  district_id INT NOT NULL,
  forecast_date DATE NOT NULL,
  forecasted_quantity INT NOT NULL,
  model_version VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (medicine_id, district_id, forecast_date)
);
```

## API Integration

The script integrates with the existing forecast API endpoint:

**Endpoint:** `POST /api/forecast/prophet/fetch`

However, `populate_forecasts.py` is more efficient because:
- ✅ Processes ALL combinations automatically
- ✅ No manual API calls needed
- ✅ Can be scheduled/automated
- ✅ Comprehensive error handling and retry logic

## Monitoring

### Check Forecast Coverage

```sql
-- Count forecasts by district and formula
SELECT 
    d.name AS district,
    f.name AS formula,
    COUNT(DISTINCT mf.forecast_date) AS forecast_days,
    MIN(mf.forecast_date) AS earliest_date,
    MAX(mf.forecast_date) AS latest_date
FROM medicine_forecast mf
JOIN district d ON mf.district_id = d.id
JOIN medicine m ON mf.medicine_id = m.id
JOIN formula f ON m.formula_id = f.id
WHERE mf.model_version = 'prophet_external_v1'
GROUP BY d.name, f.name
ORDER BY d.name, f.name;
```

### Find Missing Forecasts

```sql
-- Combinations in lookup but missing forecasts
SELECT 
    d.name AS district,
    f.name AS formula,
    COUNT(DISTINCT dml.medicine_id) AS medicine_count
FROM district_medicine_lookup dml
JOIN district d ON dml.district_id = d.id
JOIN formula f ON dml.formula_id = f.id
LEFT JOIN medicine_forecast mf ON 
    dml.district_id = mf.district_id AND
    dml.medicine_id = mf.medicine_id AND
    mf.forecast_date >= CURDATE()
WHERE mf.id IS NULL
GROUP BY d.name, f.name;
```

### Check Latest Run

```sql
-- Most recent forecast creation time
SELECT 
    model_version,
    COUNT(*) AS forecast_count,
    MAX(created_at) AS last_updated
FROM medicine_forecast
WHERE model_version = 'prophet_external_v1'
GROUP BY model_version;
```

## Best Practices

1. **Test First**: Always run with `--dry-run` before live execution
2. **Schedule Wisely**: Run during off-peak hours (e.g., 2 AM)
3. **Monitor Logs**: Keep logs of each run for troubleshooting
4. **Backup Data**: Backup database before large forecast updates
5. **Validate Results**: Spot-check forecast values for reasonableness
6. **Keep Models Fresh**: Retrain Prophet models periodically with new data

## Related Documentation

- [DISTRICT_LOOKUP_AUTO_MANAGEMENT.md](./DISTRICT_LOOKUP_AUTO_MANAGEMENT.md) - How lookup table is populated
- [FORECAST_INTEGRATION.md](./FORECAST_INTEGRATION.md) - Forecast module overview
- [forecasting/README.md](./forecasting/README.md) - Prophet model training

## Support

For issues or questions:
1. Check logs for detailed error messages
2. Verify external Prophet API is running and accessible
3. Ensure lookup table is populated with district-medicine-formula combinations
4. Review database logs for SQL errors
5. Test with `--dry-run --verbose` for detailed diagnostics
