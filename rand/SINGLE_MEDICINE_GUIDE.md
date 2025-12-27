# Single Medicine-Area Analysis - Quick Guide

## Overview
Analyze weather correlations for a specific medicine in a specific area.

## Usage

### Option 1: Auto-Run Script (Recommended)
**File**: `analyze_single_medicine.py`

1. Open the file
2. Edit these lines at the top:
   ```python
   SELECTED_MEDICINE = "Panadol"  # Change medicine name
   SELECTED_AREA = "clifton"      # Change area name
   ```
3. Run: `python analyze_single_medicine.py`

### Option 2: Interactive Script
**File**: `merge_single_medicine_area.py`

Run and select from menus:
```powershell
python merge_single_medicine_area.py
```

## Available Options

### Medicines (20 total):
- Panadol, Aspirin, Voltaren (pain/fever)
- Amoxil, Augmentin, Cipro, Rocephin, Suprax, Zithromax (antibiotics)
- Ventolin, Salbutamol (respiratory)
- Lipitor, Norvasc (cardiovascular)
- Glucophage, Eltroxin (diabetes/endocrine)
- Diflucan, Flagyl, Metronidazole (antifungals/antiparasitics)
- Omeprazole (GI)
- Hydrocortisone (steroid)

### Areas (10 Karachi neighborhoods):
- bahadurabad
- clifton
- gulistan-e-jauhar
- gulshan
- korangi
- landhi
- lyari
- north nazimabad
- pechs
- saddar

## Example Results

### Panadol in Clifton
- **Records**: 8 sales transactions
- **Weather Match**: 87.5% (7 out of 8 with weather data)
- **Date Range**: Jan 2023 - Oct 2025

**Key Findings**:
- Moderate positive correlation with temperature (r = 0.40)
- Moderate positive correlation with humidity (r = 0.39)
- Demand slightly higher on warmer, humid days
- Average demand: 17.4 units per transaction

**Interpretation**: Weather is one of several factors affecting Panadol demand in Clifton. The moderate correlations suggest that weather conditions play a role, but other factors (promotions, seasonal patterns, stock levels) are also important.

## Output Files

Each analysis creates a CSV file named:
```
sales_weather_{Medicine}_{Area}.csv
```

Example: `sales_weather_Panadol_clifton.csv`

## Understanding Correlation Strength

| Correlation | Strength | Interpretation |
|-------------|----------|----------------|
| 0.0 - 0.1 | Negligible | No meaningful relationship |
| 0.1 - 0.3 | Weak | Slight relationship |
| 0.3 - 0.5 | Moderate | Notable relationship |
| 0.5 - 0.7 | Strong | Clear relationship |
| 0.7 - 1.0 | Very Strong | Very clear relationship |

## Tips for Better Analysis

1. **More Data = Better Results**
   - Look for medicine/area combinations with 20+ records
   - More data points give more reliable correlations

2. **Consider Medicine Type**
   - Pain relievers (Panadol): May correlate with weather changes
   - Allergy meds: Likely correlate with humidity, pollen
   - Antibiotics: May show seasonal patterns
   - Chronic meds (diabetes, blood pressure): Less weather-dependent

3. **Seasonal Patterns**
   - Cold/flu season (winter): Higher pain reliever demand
   - Hot summer: Higher hydration-related issues
   - Monsoon season: More infections

4. **Data Quality Notes**
   - Some 2025 dates lack weather data (future dates)
   - Bulk orders can skew correlations
   - Small sample sizes (<10 records) are less reliable

## Modifying the Script

To analyze different combinations, edit `analyze_single_medicine.py`:

```python
# At the top of the file
SELECTED_MEDICINE = "Ventolin"    # Change this
SELECTED_AREA = "gulshan"         # Change this
```

Then run:
```powershell
python analyze_single_medicine.py
```

## Advanced Analysis Ideas

1. **Compare Multiple Areas** for the same medicine
2. **Compare Multiple Medicines** in the same area
3. **Time Series Plot**: Plot Units Sold vs Date with temperature overlay
4. **Seasonal Decomposition**: Separate trend, seasonality, and irregularities
5. **Lag Analysis**: Check if weather effects appear 1-3 days later

---

**Created**: December 2025  
**Scripts**: `analyze_single_medicine.py`, `merge_single_medicine_area.py`
