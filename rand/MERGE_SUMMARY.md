# Weather-Medicine Demand Analysis - Data Merge Summary

## Overview
This document summarizes the merge of weather data with medicine sales data for demand analysis in Karachi.

## Datasets Used

### 1. Medicine Sales Dataset
- **File**: `Med2023-2025.xlsx`
- **Original Rows**: 2,000
- **Date Range**: January 2023 to December 2025
- **Filtered Rows** (after date processing): 790 rows
- **Columns**:
  - Date
  - Brand Name
  - Generic / Formula Name
  - Area (Karachi neighborhoods)
  - Dosage / Strength
  - Therapeutic Class
  - Units Sold

**Areas Covered**: 10 neighborhoods
- Bahadurabad
- Clifton
- Gulistan-e-Jauhar
- Gulshan
- Korangi
- Landhi
- Lyari
- North Nazimabad
- PECHS
- Saddar

### 2. Weather Dataset
- **File**: `karachi_weather_2023_2024_2.csv`
- **Rows**: 731 (daily weather data)
- **Date Range**: December 2022 to December 2024
- **Coverage**: City-wide (Karachi)
- **Weather Variables**:
  - Temperature (mean, min, max) in °C
  - Relative Humidity (mean, min, max) in %
  - Precipitation Sum in mm
  - Apparent Temperature (mean, min, max) in °C

## Merge Process

### Data Transformations Applied

1. **Column Standardization**
   - Renamed "Area in Karachi" → "Area"
   - Renamed "Quantity" → "Units Sold"
   - Renamed "date" → "Date"
   - Added "Area" = "karachi" to weather data (city-wide)

2. **Date Normalization**
   - Converted all dates to datetime format
   - Removed timezone information from weather dates
   - Normalized all dates to midnight (removed time component)
   - Result: 246 matching dates between datasets

3. **Area Name Cleaning**
   - Converted all area names to lowercase
   - Stripped whitespace
   - Ensured consistency

4. **Missing Data Handling**
   - Forward-filled missing weather values by Area
   - No missing values found in weather data

5. **Merge Strategy**
   - **Method**: Left join on Date only
   - **Rationale**: Weather data is city-wide, while medicine sales are by neighborhood
   - All neighborhoods in Karachi share the same weather conditions

## Merge Results

### Output File
- **Filename**: `sales_weather_merged.csv`
- **Total Rows**: 790
- **Total Columns**: 18
- **Rows with Weather Data**: 604 (76.46%)
- **Rows without Weather Data**: 186 (23.54%)
  - These are primarily from 2025 where weather data is not yet available

### Merged Dataset Structure
```
Medicine Columns (7):
- Date
- Brand Name
- Generic / Formula Name
- Area
- Dosage / Strength
- Therapeutic Class
- Units Sold

Weather Columns (11):
- Unnamed: 0 (index)
- temperature_2m_mean
- temperature_2m_min
- temperature_2m_max
- precipitation_sum
- relative_humidity_2m_mean
- relative_humidity_2m_max
- relative_humidity_2m_min
- apparent_temperature_mean
- apparent_temperature_max
- apparent_temperature_min
```

## Correlation Analysis

### Units Sold vs. Weather Variables

| Weather Variable | Correlation | Strength | Direction |
|-----------------|-------------|----------|-----------|
| temperature_2m_mean | -0.0907 | Negligible | Negative |
| temperature_2m_min | -0.0659 | Negligible | Negative |
| temperature_2m_max | -0.1128 | Weak | Negative |
| relative_humidity_2m_mean | 0.0000 | Negligible | Positive |
| relative_humidity_2m_max | 0.0093 | Negligible | Positive |
| relative_humidity_2m_min | -0.0125 | Negligible | Negative |
| apparent_temperature_mean | -0.0830 | Negligible | Negative |
| apparent_temperature_max | -0.0989 | Negligible | Negative |
| apparent_temperature_min | -0.0696 | Negligible | Negative |

### Key Findings

1. **Temperature Effect**: Weak negative correlation (-0.11) with maximum temperature
   - Suggests slightly lower medicine demand on hotter days
   - However, the relationship is very weak

2. **Humidity Effect**: Near-zero correlation with all humidity measures
   - No clear relationship between humidity and medicine demand

3. **Overall Assessment**: 
   - Very weak correlations across all weather variables
   - Weather alone may not be a strong predictor of aggregate medicine demand
   - Other factors (seasonality, bulk orders, top-up patterns) likely dominate

### Summary Statistics

#### Units Sold
- Mean: 26.37 units
- Median: 27.00 units
- Std Dev: 14.38
- Range: 1 to 50 units

#### Temperature (°C)
- Mean Temperature: 26.33°C (79°F)
- Min Temperature: 22.83°C (73°F)
- Max Temperature: 30.50°C (87°F)

#### Humidity (%)
- Mean Humidity: 66.74%
- Range: 13.81% to 87.06%

#### Precipitation
- Mean: Not reported (likely low for Karachi's arid climate)

## Usage Instructions

### Running the Merge Script

```powershell
cd "d:\Medicine-App-main\Medicine-App-main"
python merge_weather_medicine_data.py
```

### Script Features

The script (`merge_weather_medicine_data.py`) automatically:
1. Loads both datasets
2. Standardizes column names
3. Converts and normalizes dates
4. Cleans area names
5. Handles missing data
6. Merges datasets intelligently
7. Saves output to CSV
8. Calculates correlations
9. Provides detailed console output

### Input Requirements

Place these files in the same directory as the script:
- `medicine_sales_25_medicines_2020_2024.xlsx` OR `Med2023-2025.xlsx`
- `weather.csv` OR `karachi_weather_2023_2024_2.csv` OR `weather.xlsx`

### Output

- **Main Output**: `sales_weather_merged.csv`
- **Console Output**: Detailed statistics and correlation analysis

## Next Steps for Analysis

### Recommended Analyses

1. **Seasonal Analysis**
   - Group by season and compare demand patterns
   - The dataset includes a Season column

2. **Medicine-Specific Correlations**
   - Analyze correlations by therapeutic class
   - Some medicine types may be more weather-sensitive (e.g., allergy medications)

3. **Time Series Analysis**
   - Apply time series decomposition to separate:
     - Trend (long-term direction)
     - Seasonality (recurring patterns)
     - Irregular component (bulk orders, promotions)

4. **Lag Analysis**
   - Weather effects may have delayed impacts
   - Analyze correlations with 1-7 day lags

5. **Area-Based Analysis**
   - Compare demand patterns across different neighborhoods
   - Identify location-specific trends

6. **Multi-Variable Models**
   - Combine weather, season, area, and medicine type
   - Use regression or machine learning models

### Data Quality Considerations

1. **Date Coverage Gap**: 23.54% of medicine sales lack weather data (2025 dates)
2. **Bulk Orders**: Units Sold contains irregular patterns from bulk purchases
3. **Aggregation Level**: Monthly vs. daily granularity may affect correlations
4. **Medicine Mix**: Different therapeutic classes may respond differently to weather

## Technical Notes

- **Python Version**: 3.14+
- **Dependencies**: pandas, numpy, openpyxl (for Excel files)
- **Date Format**: All dates normalized to YYYY-MM-DD format
- **Missing Data Strategy**: Forward-fill by Area (though none found in weather data)
- **Merge Type**: Left join preserves all medicine sales records

---

**Generated**: December 2025  
**Script**: `merge_weather_medicine_data.py`  
**Output**: `sales_weather_merged.csv`
