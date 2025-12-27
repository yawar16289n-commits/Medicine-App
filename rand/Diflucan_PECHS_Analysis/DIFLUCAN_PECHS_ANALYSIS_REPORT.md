# Diflucan Sales Analysis in PECHS - Complete Report

## 📊 Analysis Overview

**Medicine**: **Diflucan** (Fluconazole - Antifungal)  
**Area**: **PECHS** (Pakistan Employees Co-operative Housing Society)  
**Analysis Date**: December 2025

---

## 🎯 TWO SEPARATE ANALYSES COMPLETED

### 1️⃣ Medicine Sales Mapping (NO Weather Influence)
**Focus**: Pure sales patterns, trends, and business insights

### 2️⃣ Weather Impact Analysis (WITH Complete Date Range)
**Focus**: Weather correlations with zero-filled sales data

---

## 📈 PART 1: MEDICINE SALES MAPPING (NO WEATHER)

### Key Statistics

| Metric | Value |
|--------|-------|
| **Total Transactions** | 21 sales |
| **Date Range** | Feb 5, 2023 - Mar 6, 2025 |
| **Time Span** | 760 days (2+ years) |
| **Total Units Sold** | 543 units |
| **Average Sale Size** | 25.86 units |
| **Median Sale Size** | 31 units |
| **Sales Frequency** | Every 126.7 days (avg) |
| **Median Gap** | 44 days between sales |

### Sales Distribution

- **Minimum Sale**: 1 unit
- **Maximum Sale**: 50 units
- **Standard Deviation**: 16.18 units
- **Typical Range**: 10-40 units per transaction

### Monthly Sales Pattern

| Month | Transactions | Total Units | Avg per Transaction |
|-------|-------------|-------------|---------------------|
| **Feb 2023** | 3 | 49 | 16.33 |
| **Apr 2023** | 1 | 50 | 50.00 |
| **May 2023** | 1 | 2 | 2.00 |
| **Oct 2024** | 1 | 33 | 33.00 |
| **Mar 2025** | 1 | 31 | 31.00 |

**Note**: Many transactions have missing dates (14 out of 21), suggesting data quality issues.

### Seasonal Distribution

| Month | Transactions | Total Units |
|-------|-------------|-------------|
| February | 3 | 49 |
| March | 1 | 31 |
| April | 1 | 50 |
| May | 1 | 2 |
| October | 1 | 33 |

### Purchase Pattern Analysis

**Gap Between Sales**:
- Average: 126.7 days (~4 months)
- Median: 44 days (~1.5 months)
- Range: 1 to 513 days

**Interpretation**:
- ⚠️ **Highly irregular pattern** - Sales vary from consecutive days to 17-month gaps
- 📦 **Bulk ordering behavior** - Large order sizes (median 31 units)
- 🏥 **Likely pharmacy restocking** - Not consumer retail pattern
- 📊 **Inventory-driven** - Orders placed when stock runs low, not by demand

### Formulation Variations

Multiple dosages sold:
- 150 mg tablet (most common)
- 100 mg capsule
- 50 mg tablet
- 125 mg/5 mL syrup
- 100 µg inhaler
- 20 mg capsule
- 500 mg tablet

**This variety suggests wholesale/pharmacy distribution rather than consumer retail.**

---

## 🌡️ PART 2: WEATHER IMPACT ANALYSIS (WITH ZERO-FILLED SALES)

### Complete Date Range Analysis

| Metric | Value |
|--------|-------|
| **Analysis Period** | Feb 5, 2023 - Dec 30, 2024 |
| **Total Days** | 695 days |
| **Days with Sales** | 6 days (0.9%) |
| **Days without Sales** | 689 days (99.1%) |
| **Total Units (in range)** | 134 units |
| **Average Daily Sales** | 0.19 units/day |
| **Max Daily Sales** | 50 units |

### Weather Correlations

| Weather Variable | Correlation | Strength | Direction |
|-----------------|-------------|----------|-----------|
| **Temperature (mean)** | -0.0255 | Negligible | Negative |
| **Humidity (mean)** | +0.0301 | Negligible | Positive |
| **Precipitation** | -0.0134 | Negligible | Negative |

### Interpretation: Why No Weather Correlation?

1. **Extremely Sparse Sales** (0.9% of days)
   - 689 days with zero sales dominate the dataset
   - Weather variations have no impact on 99% of days

2. **Bulk Ordering Pattern**
   - Sales occur when pharmacy inventory is low
   - Not driven by weather-induced demand

3. **Antifungal Medicine**
   - Diflucan treats fungal infections
   - Not typically weather-sensitive like cold medicines

4. **Wholesale Distribution**
   - Large orders (25+ units average)
   - Business-to-business transactions
   - Scheduled restocking, not consumer demand

---

## 📁 OUTPUT FILES CREATED

### Sales Mapping (No Weather)

1. **`medicine_sales_mapping_diflucan_pechs.csv`**
   - 21 rows (all transactions)
   - Columns: date, brand, formulation, dosage, units, frequency metrics
   - Shows pure sales pattern without weather

2. **`sales_mapping_diflucan_pechs.png`**
   - 4 visualization panels:
     - Timeline: Sales over time
     - Monthly totals: Bar chart
     - Distribution: Histogram of sale sizes
     - Frequency: Days between sales

### Weather Impact Analysis

3. **`medicine_weather_single.csv`**
   - 695 rows (every day in range)
   - Zero-filled sales for complete picture
   - All weather variables included

4. **`weather_impact_diflucan_pechs_complete.png`**
   - 3 time-series plots:
     - Units Sold vs Temperature
     - Units Sold vs Humidity
     - Units Sold vs Precipitation

5. **`correlation_scatter_diflucan_pechs.png`**
   - 3 scatter plots (sale days only):
     - Temperature vs Units
     - Humidity vs Units
     - Precipitation vs Units
   - Shows correlation coefficients

---

## 💡 KEY INSIGHTS & RECOMMENDATIONS

### Business Insights

1. **Inventory Management**
   - Average 127-day reorder cycle
   - Suggest implementing scheduled ordering
   - Reduce variability (1-513 day gaps)

2. **Demand Forecasting**
   - Weather NOT a useful predictor
   - Focus on historical cycles (monthly/seasonal)
   - Track inventory levels instead

3. **Data Quality Issues**
   - 14 transactions missing dates (67%)
   - Need better transaction timestamp recording
   - Consider implementing POS system

### Statistical Insights

1. **Sale Pattern**: Highly irregular, bulk-driven
2. **Weather Correlation**: Negligible (as expected for antifungals)
3. **Sample Size**: 21 transactions is better than Panadol (7), but still limited
4. **Zero-Inflation**: 99% of days have no sales - typical for wholesale

### Comparison: Diflucan vs. Panadol

| Metric | Diflucan (PECHS) | Panadol (Clifton) |
|--------|------------------|-------------------|
| Transactions | 21 | 7 |
| Total Units | 543 | 139 |
| Avg Sale Size | 25.86 | 17.38 |
| Days with Sales | 0.9% | 1.0% |
| Weather Correlation | Negligible | Negligible |

**Both show bulk ordering patterns with no weather correlation.**

---

## 🔬 METHODOLOGY COMPARISON

### Approach 1: Sales Mapping Only
**Advantages**:
- ✅ Focuses on actual transactions
- ✅ Clear business patterns
- ✅ No zero-inflation
- ✅ Easier to interpret

**Best for**:
- Business analytics
- Inventory management
- Purchase pattern analysis
- Supply chain optimization

### Approach 2: Weather + Complete Date Range
**Advantages**:
- ✅ Full temporal context
- ✅ Can identify seasonal gaps
- ✅ Shows true sales sparsity
- ✅ Better for forecasting

**Best for**:
- Weather impact studies
- Demand forecasting
- Time-series modeling
- Academic research

---

## 📊 VISUALIZATION GUIDE

### Sales Mapping Visualizations (4 Plots)

1. **Sales Timeline**
   - Shows when purchases occurred
   - Reveals clustering and gaps
   - Identifies irregular patterns

2. **Monthly Aggregation**
   - Bar chart of monthly totals
   - Easy comparison across months
   - Shows seasonal trends

3. **Sale Size Distribution**
   - Histogram of units per transaction
   - Shows typical order sizes
   - Mean vs median comparison

4. **Sales Frequency**
   - Histogram of days between sales
   - Identifies reorder patterns
   - Shows variability in cycles

### Weather Impact Visualizations (5 Plots)

1-3. **Time Series (3 plots)**
   - Bar: Daily units (mostly zeros)
   - Line: Weather variable
   - Shows lack of correlation visually

4-6. **Scatter Plots (3 plots)**
   - Only sale days plotted
   - X-axis: Weather variable
   - Y-axis: Units sold
   - Correlation coefficient shown

---

## 🎯 CONCLUSIONS

### Main Findings

1. **Diflucan sales in PECHS are irregular and bulk-driven**
   - 21 transactions over 2+ years
   - Average 127 days between orders
   - Typical order: 26 units

2. **Weather has negligible impact on sales**
   - All correlations < |0.03|
   - Expected for wholesale pharmaceutical distribution
   - Inventory cycles dominate over weather

3. **Better sample size than Panadol**
   - 3x more transactions (21 vs 7)
   - Still shows wholesale pattern
   - Same zero-inflation issue (99%)

### Recommendations

**For Better Analysis**:
- ✅ Use medicines with daily consumer sales
- ✅ Aggregate across multiple areas
- ✅ Focus on weather-sensitive medicines (cold/flu)
- ✅ Get retail-level data instead of wholesale

**For This Data**:
- ✅ Use sales mapping for inventory planning
- ✅ Don't rely on weather for forecasting
- ✅ Focus on historical reorder cycles
- ✅ Improve data quality (capture all timestamps)

---

## 🔧 TECHNICAL DETAILS

### Scripts Used

1. **`medicine_sales_mapping.py`**
   - Pure sales analysis
   - No weather data
   - Business-focused metrics

2. **`weather_analysis_simple.py`**
   - Weather correlation analysis
   - Zero-filled complete date range
   - Statistical correlations

3. **`create_plots.py`**
   - Weather impact visualizations
   - Time series and scatter plots

### Dependencies
```python
pandas, numpy, matplotlib, openpyxl
```

### How to Analyze Different Medicine/Area

Edit configuration in scripts:
```python
SELECTED_MEDICINE = "Diflucan"  # Change here
SELECTED_AREA = "pechs"         # Change here
```

Run:
```bash
python medicine_sales_mapping.py
python weather_analysis_simple.py
python create_plots.py
```

---

**Analysis Complete**: December 2025  
**Medicine**: Diflucan (Fluconazole)  
**Area**: PECHS, Karachi  
**Files**: 5 output files (2 CSV + 3 PNG)
