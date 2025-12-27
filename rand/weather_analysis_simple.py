"""
Weather Impact Analysis - Single Medicine in Single Area (Simplified)
Shows ALL weather dates with zero-filled sales
"""

import pandas as pd
import numpy as np

# Configuration
SELECTED_MEDICINE = "Diflucan"
SELECTED_AREA = "pechs"

print("="*70)
print("WEATHER IMPACT ANALYSIS - COMPLETE DATE RANGE")
print("="*70)
print(f"\nMedicine: {SELECTED_MEDICINE}")
print(f"Area: {SELECTED_AREA}\n")

# Load data
print("[1] Loading datasets...")
sales_df = pd.read_excel('Med2023-2025.xlsx')
weather_df = pd.read_csv('karachi_weather_2023_2024_2.csv')
print(f"    Sales: {len(sales_df)} rows")
print(f"    Weather: {len(weather_df)} rows")

# Standardize columns
print("\n[2] Standardizing columns...")
sales_df.columns = sales_df.columns.str.lower().str.strip().str.replace(' ', '_')
weather_df.columns = weather_df.columns.str.lower().str.strip().str.replace(' ', '_')

# Convert dates
print("[3] Converting dates...")
sales_df['date'] = pd.to_datetime(sales_df['date'], errors='coerce').dt.normalize()
weather_df['date'] = pd.to_datetime(weather_df['date'], errors='coerce')
if weather_df['date'].dt.tz is not None:
    weather_df['date'] = weather_df['date'].dt.tz_localize(None)
weather_df['date'] = weather_df['date'].dt.normalize()

# Clean areas
print("[4] Cleaning area names...")
for col in sales_df.columns:
    if 'area' in col:
        sales_df['area'] = sales_df[col].str.lower().str.strip()
        break

weather_df['area'] = 'karachi'  # City-wide

# Rename units column
for col in sales_df.columns:
    if 'quantity' in col or 'units' in col:
        sales_df['units_sold'] = sales_df[col]
        break

# Filter sales
print(f"\n[5] Filtering sales for {SELECTED_MEDICINE} in {SELECTED_AREA}...")
brand_col = [c for c in sales_df.columns if 'brand' in c][0]
filtered_sales = sales_df[
    (sales_df[brand_col].str.lower() == SELECTED_MEDICINE.lower()) &
    (sales_df['area'] == SELECTED_AREA.lower())
].copy()

print(f"    Found {len(filtered_sales)} sales records")
print(f"    Date range: {filtered_sales['date'].min().date()} to {filtered_sales['date'].max().date()}")
print(f"    Total units: {filtered_sales['units_sold'].sum():.0f}")

# Get date range
min_date = max(filtered_sales['date'].min(), weather_df['date'].min())
max_date = min(filtered_sales['date'].max(), weather_df['date'].max())

print(f"\n[6] Creating complete date range...")
print(f"    From: {min_date.date()}")
print(f"    To: {max_date.date()}")

# Create full date range
date_range = pd.date_range(start=min_date, end=max_date, freq='D')
full_df = pd.DataFrame({'date': date_range})
print(f"    Total days: {len(full_df)}")

# Aggregate sales by date
sales_agg = filtered_sales.groupby('date')['units_sold'].sum().reset_index()

# Merge with full date range
full_df = full_df.merge(sales_agg, on='date', how='left')
full_df['units_sold'] = full_df['units_sold'].fillna(0)

sale_days = (full_df['units_sold'] > 0).sum()
print(f"    Days with sales: {sale_days}")
print(f"    Days without sales: {len(full_df) - sale_days}")

# Merge with weather
print(f"\n[7] Merging with weather data...")
weather_subset = weather_df[[c for c in weather_df.columns if c != 'area']]
full_df = full_df.merge(weather_subset, on='date', how='left')

weather_coverage = full_df['temperature_2m_mean'].notna().sum()
print(f"    Days with weather data: {weather_coverage}")

# Calculate correlations
print(f"\n[8] Calculating correlations...")
print(f"\n{'Weather Variable':<40} {'Correlation':>12} {'Strength':>15}")
print("-" * 70)

weather_vars = {
    'temperature_2m_mean': 'Temperature (mean)',
    'relative_humidity_2m_mean': 'Humidity (mean)',
    'precipitation_sum': 'Precipitation'
}

correlations = {}
for col, label in weather_vars.items():
    if col in full_df.columns:
        valid = full_df[['units_sold', col]].dropna()
        if len(valid) > 2:
            corr = valid['units_sold'].corr(valid[col])
            correlations[col] = corr
            
            if abs(corr) < 0.1:
                strength = "negligible"
            elif abs(corr) < 0.3:
                strength = "weak"
            elif abs(corr) < 0.5:
                strength = "moderate"
            elif abs(corr) < 0.7:
                strength = "strong"
            else:
                strength = "very strong"
            
            print(f"{label:<40} {corr:>+12.4f} {strength:>15}")

# Save results
print(f"\n[9] Saving results...")
filename = "medicine_weather_single.csv"
full_df.to_csv(filename, index=False)
print(f"    Saved: {filename}")
print(f"    Rows: {len(full_df)}")
print(f"    Columns: {len(full_df.columns)}")

# Summary
print(f"\n{'='*70}")
print("SUMMARY")
print(f"{'='*70}")
print(f"\nDataset: {SELECTED_MEDICINE} in {SELECTED_AREA}")
print(f"Period: {full_df['date'].min().date()} to {full_df['date'].max().date()}")
print(f"Total Days: {len(full_df)}")
print(f"Days with Sales: {sale_days} ({sale_days/len(full_df)*100:.1f}%)")
print(f"Total Units Sold: {full_df['units_sold'].sum():.0f}")
print(f"Average Daily Sales: {full_df['units_sold'].mean():.2f}")
print(f"Max Daily Sales: {full_df['units_sold'].max():.0f}")

print(f"\n✅ COMPLETE! Output saved to: {filename}")
print("="*70)
