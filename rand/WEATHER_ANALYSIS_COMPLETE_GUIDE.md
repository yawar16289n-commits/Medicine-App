# Weather Impact Analysis - Single Medicine & Area
## Alternative Approach: Complete Date Range with Zero-Filled Sales

---

## 📊 Analysis Summary

### Configuration
- **Medicine**: Panadol (Paracetamol)
- **Area**: Clifton, Karachi
- **Approach**: All weather dates with zero-filled sales (complete picture)

### Dataset Overview
- **Total Days Analyzed**: 727 days (2023-01-04 to 2024-12-30)
- **Days with Sales**: 7 days (1.0%)
- **Days without Sales**: 720 days (99.0%)
- **Total Units Sold**: 123 units
- **Average Daily Sales**: 0.17 units/day
- **Maximum Daily Sales**: 41 units

---

## 🎯 Key Difference: Alternative Approach vs. Previous Approach

### Previous Approach (Only Sale Days)
```
Result: 7 rows
Each row = 1 sale transaction
Missing: All other 720 days
```

### Alternative Approach (Complete Date Range)
```
Result: 727 rows
- 7 rows with sales > 0
- 720 rows with sales = 0
Includes: Every single day in the date range
```

---

## 🌡️ Weather Correlations

### Based on 727 Complete Days

| Weather Variable | Correlation | Strength | Interpretation |
|-----------------|-------------|----------|----------------|
| Temperature (mean) | -0.0015 | Negligible | No relationship |
| Humidity (mean) | -0.0049 | Negligible | No relationship |
| Precipitation (sum) | -0.0150 | Negligible | No relationship |

### Why Are Correlations So Low?

1. **Sparse Sales Pattern**: Only 1% of days have sales
   - 720 days with 0 sales overwhelm the signal
   - Most days have same value (zero) regardless of weather

2. **Irregular Purchase Pattern**: 
   - Medicine sold in bulk/top-up orders
   - Not driven by daily demand
   - Pharmacy restocking schedule dominates

3. **Small Sample**: Only 7 sale days
   - Not enough variation to detect patterns
   - Statistical correlations unreliable

---

## 📈 Visualizations Created

### 1. Time Series Plots (3 plots)
**File**: `weather_impact_panadol_clifton_complete.png`

Shows the complete timeline with:
- Bar chart: Units sold (mostly zeros with 7 peaks)
- Line plot: Weather variable over time
- Covers all 727 days

**Three subplots**:
1. Units Sold vs Temperature
2. Units Sold vs Humidity  
3. Units Sold vs Precipitation

### 2. Correlation Scatter Plots (3 plots)
**File**: `correlation_scatter_panadol_clifton.png`

Shows only the 7 sale days:
- X-axis: Weather variable
- Y-axis: Units sold
- Shows correlation coefficient

**Three scatter plots**:
1. Temperature vs Units (r = correlation)
2. Humidity vs Units (r = correlation)
3. Precipitation vs Units (r = correlation)

---

## 📁 Output Files

### 1. `medicine_weather_single.csv`
Complete dataset with 727 rows

**Columns**:
- `date`: Daily timestamps
- `units_sold`: 0 for most days, actual values for 7 sale days
- `temperature_2m_mean`: Daily mean temperature (°C)
- `temperature_2m_min`: Daily minimum temperature
- `temperature_2m_max`: Daily maximum temperature
- `precipitation_sum`: Daily precipitation (mm)
- `relative_humidity_2m_mean`: Daily mean humidity (%)
- `relative_humidity_2m_max`: Daily maximum humidity
- `relative_humidity_2m_min`: Daily minimum humidity
- `apparent_temperature_mean`: "Feels like" temperature
- `apparent_temperature_max`: Maximum apparent temperature
- `apparent_temperature_min`: Minimum apparent temperature

**Sample rows**:
```
date,units_sold,temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean
2023-01-04,18.0,17.46,0.0,31.66
2023-01-05,0.0,18.43,0.0,28.07
2023-01-06,0.0,19.90,0.0,29.17
...
2024-12-30,0.0,19.82,0.0,34.73
```

### 2. Visualization PNG files (2 files)
- `weather_impact_panadol_clifton_complete.png` - Time series
- `correlation_scatter_panadol_clifton.png` - Scatter plots

---

## 💡 Insights & Interpretation

### What This Analysis Shows

1. **Sporadic Demand Pattern**
   - Panadol purchased only 7 times in 2 years
   - Indicates bulk/wholesale purchasing
   - Not driven by daily consumer demand

2. **Weather Has Minimal Impact**
   - Negligible correlations across all variables
   - Weather doesn't predict when pharmacies restock
   - Other factors dominate (inventory, supplier schedules)

3. **Zero-Inflation Problem**
   - Dataset dominated by zeros (99%)
   - Makes traditional correlation analysis less meaningful
   - Better suited for time-to-event or count models

### Recommendations

For medicines with sparse sales like this:

1. **Aggregate Temporally**
   - Weekly or monthly totals instead of daily
   - Reduces zero-inflation

2. **Different Medicine/Area**
   - Try medicines with more frequent sales
   - Try areas with higher transaction volumes

3. **Alternative Analysis Methods**
   - Compare sale days vs. non-sale days (t-test)
   - Logistic regression (sale vs. no-sale)
   - Time-series forecasting with ARIMA/Prophet

4. **Combine Multiple Areas**
   - Aggregate Panadol sales across all Karachi
   - Increases sample size and reduces sparsity

---

## 🔧 Technical Implementation

### Scripts Created

1. **`weather_analysis_simple.py`**
   - Main analysis script
   - Loads, cleans, merges data
   - Calculates correlations
   - Outputs CSV file

2. **`create_plots.py`**
   - Creates visualizations
   - Time series plots
   - Correlation scatter plots

### Dependencies
```python
pandas
numpy
matplotlib
openpyxl  # for Excel files
```

### How to Modify

Edit configuration at top of `weather_analysis_simple.py`:
```python
SELECTED_MEDICINE = "Panadol"  # Change medicine
SELECTED_AREA = "clifton"      # Change area
```

Then run:
```bash
python weather_analysis_simple.py
python create_plots.py
```

---

## 📊 Comparison: Sale Days Only vs. Complete Range

### Sale Days Only (Previous)
**Pros**:
- Focuses on actual transactions
- Higher correlations (less noise)
- Smaller, manageable dataset

**Cons**:
- Missing temporal context
- Can't see seasonality
- Can't identify "why no sales?"

### Complete Range (This Analysis)
**Pros**:
- Full temporal picture
- Shows seasonal patterns
- Can analyze "sale vs. no-sale"
- Better for forecasting

**Cons**:
- Zero-inflated (99% zeros)
- Lower correlations
- Larger dataset

---

## 🎓 Statistical Notes

### Why Low Correlations Are Expected

1. **Binary-like outcome**: Sale (1-50 units) vs. No sale (0)
2. **Rare events**: Only 1% of days have sales
3. **Batch effects**: Sales may occur regardless of weather when inventory runs low
4. **Weather variation is continuous** while sales are discrete/sparse

### Appropriate Metrics for This Data

Instead of Pearson correlation, consider:
- **Point-biserial correlation**: For binary sale/no-sale
- **Mann-Whitney U test**: Compare weather on sale vs. non-sale days
- **Logistic regression**: Predict probability of sale given weather
- **Poisson/Negative binomial**: Model count data with zeros

---

## ✅ Conclusion

The alternative approach successfully created a complete temporal analysis showing:
- All 727 days of weather data
- Zero-filled sales for complete context
- Negligible weather correlations due to sparse sales pattern
- Clear visualization of temporal patterns

**Key Finding**: Weather does not significantly impact Panadol purchasing in Clifton for this dataset, likely because sales represent bulk restocking rather than weather-driven consumer demand.

---

**Analysis Date**: December 2025  
**Scripts**: `weather_analysis_simple.py`, `create_plots.py`  
**Output**: `medicine_weather_single.csv` + 2 PNG visualizations
