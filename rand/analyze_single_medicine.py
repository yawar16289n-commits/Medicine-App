"""
Merge Weather and Medicine Sales Data - Single Medicine & Single Area (Auto-run)
Pre-configured for: Panadol in Clifton
Modify SELECTED_MEDICINE and SELECTED_AREA variables to analyze different combinations.
"""

import pandas as pd
import numpy as np

# ============================================================
# CONFIGURATION - CHANGE THESE VALUES
# ============================================================
SELECTED_MEDICINE = "Panadol"  # Change to any medicine name
SELECTED_AREA = "clifton"      # Change to any area name (lowercase)
# ============================================================


def load_datasets():
    """Load both medicine sales and weather datasets."""
    print("Loading datasets...")
    
    try:
        medicine_df = pd.read_excel('medicine_sales_25_medicines_2020_2024.xlsx')
        print("✓ Loaded medicine_sales_25_medicines_2020_2024.xlsx")
    except FileNotFoundError:
        try:
            medicine_df = pd.read_excel('Med2023-2025.xlsx')
            print("✓ Loaded Med2023-2025.xlsx")
        except FileNotFoundError:
            print("Error: Medicine sales file not found.")
            return None, None
    
    try:
        weather_df = pd.read_csv('weather.csv')
        print("✓ Loaded weather.csv")
    except FileNotFoundError:
        try:
            weather_df = pd.read_csv('karachi_weather_2023_2024_2.csv')
            print("✓ Loaded karachi_weather_2023_2024_2.csv")
        except FileNotFoundError:
            print("Error: Weather file not found.")
            return None, None
    
    return medicine_df, weather_df


def standardize_columns(medicine_df, weather_df):
    """Standardize column names for both datasets."""
    medicine_df.columns = medicine_df.columns.str.strip()
    
    # Date column
    date_variations = ['date', 'Date', 'DATE']
    for col in medicine_df.columns:
        if col.strip().lower() in [v.lower() for v in date_variations]:
            medicine_df.rename(columns={col: 'Date'}, inplace=True)
            break
    
    # Area column
    area_variations = ['area', 'Area', 'area in karachi']
    for col in medicine_df.columns:
        if col.strip().lower() in [v.lower() for v in area_variations]:
            medicine_df.rename(columns={col: 'Area'}, inplace=True)
            break
    
    # Units Sold column
    units_variations = ['units sold', 'quantity', 'units', 'qty']
    for col in medicine_df.columns:
        if col.strip().lower() in [v.lower() for v in units_variations]:
            medicine_df.rename(columns={col: 'Units Sold'}, inplace=True)
            break
    
    # Weather columns
    weather_df.columns = weather_df.columns.str.strip()
    for col in weather_df.columns:
        if col.strip().lower() in [v.lower() for v in date_variations]:
            weather_df.rename(columns={col: 'Date'}, inplace=True)
            break
    
    # Add Area to weather if missing
    if 'Area' not in weather_df.columns:
        weather_df['Area'] = 'karachi'
    
    return medicine_df, weather_df


def convert_dates(medicine_df, weather_df):
    """Convert Date columns to datetime format."""
    medicine_df['Date'] = pd.to_datetime(medicine_df['Date'], errors='coerce')
    weather_df['Date'] = pd.to_datetime(weather_df['Date'], errors='coerce')
    
    # Remove timezone
    if weather_df['Date'].dt.tz is not None:
        weather_df['Date'] = weather_df['Date'].dt.tz_localize(None)
    if medicine_df['Date'].dt.tz is not None:
        medicine_df['Date'] = medicine_df['Date'].dt.tz_localize(None)
    
    # Normalize to midnight
    medicine_df['Date'] = medicine_df['Date'].dt.normalize()
    weather_df['Date'] = weather_df['Date'].dt.normalize()
    
    # Remove invalid dates
    medicine_df = medicine_df.dropna(subset=['Date'])
    weather_df = weather_df.dropna(subset=['Date'])
    
    return medicine_df, weather_df


def clean_area_names(medicine_df, weather_df):
    """Clean and standardize area/city names."""
    medicine_df['Area'] = medicine_df['Area'].astype(str).str.lower().str.strip()
    weather_df['Area'] = weather_df['Area'].astype(str).str.lower().str.strip()
    return medicine_df, weather_df


def filter_data(medicine_df, selected_medicine, selected_area):
    """Filter dataset for selected medicine and area."""
    print("\n" + "="*60)
    print("FILTERING DATA")
    print("="*60)
    print(f"Medicine: {selected_medicine}")
    print(f"Area: {selected_area}")
    
    # Find brand column
    brand_col = None
    for col in ['Brand Name', 'brand name', 'Medicine', 'Product']:
        if col in medicine_df.columns:
            brand_col = col
            break
    
    if brand_col is None:
        print("Error: Could not find medicine/brand column")
        return None
    
    # Filter
    filtered_df = medicine_df[
        (medicine_df[brand_col] == selected_medicine) &
        (medicine_df['Area'] == selected_area)
    ].copy()
    
    print(f"\nFiltered records: {len(filtered_df)}")
    
    if len(filtered_df) == 0:
        print("\nError: No records found for this combination.")
        print("\nAvailable medicines:")
        print(sorted(medicine_df[brand_col].unique()))
        print("\nAvailable areas:")
        print(sorted(medicine_df['Area'].unique()))
        return None
    
    print(f"Date range: {filtered_df['Date'].min().date()} to {filtered_df['Date'].max().date()}")
    print(f"Units Sold range: {filtered_df['Units Sold'].min():.0f} to {filtered_df['Units Sold'].max():.0f}")
    
    if len(filtered_df) < 10:
        print("\n⚠ Warning: Few records. Correlations may not be statistically reliable.")
    
    return filtered_df


def merge_with_weather(filtered_df, weather_df):
    """Merge filtered medicine data with weather."""
    print("\n" + "="*60)
    print("MERGING WITH WEATHER DATA")
    print("="*60)
    
    # Drop Area from weather (city-wide data)
    weather_merge = weather_df.drop(columns=['Area'] if 'Area' in weather_df.columns else [])
    
    # Merge on Date
    merged_df = filtered_df.merge(weather_merge, on='Date', how='left')
    
    # Count matches
    weather_cols = [col for col in weather_merge.columns if col != 'Date']
    rows_with_weather = merged_df[weather_cols[0]].notna().sum() if weather_cols else 0
    
    print(f"Total records: {len(merged_df)}")
    print(f"Records with weather data: {rows_with_weather} ({rows_with_weather/len(merged_df)*100:.1f}%)")
    
    if rows_with_weather == 0:
        print("\n⚠ Warning: No weather data matched! Check date ranges.")
    
    return merged_df


def analyze_correlations(merged_df, medicine_name, area_name):
    """Calculate and display correlations."""
    print("\n" + "="*60)
    print(f"CORRELATION ANALYSIS")
    print(f"Medicine: {medicine_name}")
    print(f"Area: {area_name}")
    print("="*60)
    
    # Identify weather columns
    weather_cols = []
    priority_cols = []  # Temperature and humidity
    
    for col in merged_df.columns:
        col_lower = col.lower()
        if any(w in col_lower for w in ['temperature', 'temp', 'humidity', 'rainfall', 'rain', 'precipitation']):
            weather_cols.append(col)
            if 'mean' in col_lower or 'avg' in col_lower or ('temperature' in col_lower and 'max' not in col_lower and 'min' not in col_lower):
                priority_cols.append(col)
    
    if not weather_cols:
        print("No weather columns found.")
        return merged_df, {}
    
    print(f"\nAnalyzing {len(weather_cols)} weather variables")
    
    # Calculate correlations
    correlations = {}
    print("\nCORRELATIONS WITH UNITS SOLD:")
    print("-" * 60)
    
    for weather_col in weather_cols:
        valid_data = merged_df[['Units Sold', weather_col]].dropna()
        
        if len(valid_data) >= 3:
            correlation = valid_data['Units Sold'].corr(valid_data[weather_col])
            correlations[weather_col] = correlation
            
            # Interpret
            if abs(correlation) < 0.1:
                strength = "negligible"
            elif abs(correlation) < 0.3:
                strength = "weak"
            elif abs(correlation) < 0.5:
                strength = "moderate"
            elif abs(correlation) < 0.7:
                strength = "strong"
            else:
                strength = "very strong"
            
            direction = "positive" if correlation > 0 else "negative"
            
            # Format output
            sign = "+" if correlation > 0 else ""
            print(f"{weather_col:40s} {sign}{correlation:7.4f}  ({strength} {direction})")
    
    # Summary statistics
    print(f"\n{'='*60}")
    print("SUMMARY STATISTICS")
    print(f"{'='*60}")
    
    print(f"\n📊 Units Sold:")
    print(f"   Records: {merged_df['Units Sold'].count()}")
    print(f"   Mean:    {merged_df['Units Sold'].mean():.2f} units")
    print(f"   Median:  {merged_df['Units Sold'].median():.2f} units")
    print(f"   Std Dev: {merged_df['Units Sold'].std():.2f}")
    print(f"   Range:   {merged_df['Units Sold'].min():.0f} - {merged_df['Units Sold'].max():.0f} units")
    
    # Show key weather variables
    key_weather = [col for col in weather_cols if 'mean' in col.lower() or 'sum' in col.lower()][:4]
    
    for weather_col in key_weather:
        if merged_df[weather_col].notna().sum() > 0:
            units = ""
            if 'temp' in weather_col.lower():
                units = "°C"
            elif 'humid' in weather_col.lower():
                units = "%"
            elif 'precip' in weather_col.lower() or 'rain' in weather_col.lower():
                units = "mm"
            
            print(f"\n🌡️  {weather_col}:")
            print(f"   Mean:    {merged_df[weather_col].mean():.2f} {units}")
            print(f"   Median:  {merged_df[weather_col].median():.2f} {units}")
            print(f"   Range:   {merged_df[weather_col].min():.2f} - {merged_df[weather_col].max():.2f} {units}")
    
    # Interpretation
    print(f"\n{'='*60}")
    print("INTERPRETATION")
    print(f"{'='*60}")
    
    # Find strongest correlation
    if correlations:
        strongest = max(correlations.items(), key=lambda x: abs(x[1]))
        print(f"\nStrongest correlation: {strongest[0]}")
        print(f"Coefficient: {strongest[1]:.4f}")
        
        if abs(strongest[1]) < 0.3:
            print("\n💡 Weather shows weak correlation with demand for this medicine/area.")
            print("   Other factors (promotions, seasonality, stock-outs) may be more influential.")
        elif abs(strongest[1]) < 0.5:
            print("\n💡 Moderate weather correlation detected.")
            print("   Weather is one of several factors affecting demand.")
        else:
            print("\n💡 Strong weather correlation detected!")
            print("   Weather is a significant driver of demand patterns.")
    
    return merged_df, correlations


def save_results(merged_df, medicine_name, area_name):
    """Save filtered results to CSV."""
    print("\n" + "="*60)
    print("SAVING RESULTS")
    print("="*60)
    
    # Create safe filename
    safe_medicine = medicine_name.replace(' ', '_').replace('/', '_')
    safe_area = area_name.replace(' ', '_').replace('-', '_')
    filename = f"sales_weather_{safe_medicine}_{safe_area}.csv"
    
    merged_df.to_csv(filename, index=False)
    print(f"✓ Saved to: {filename}")
    print(f"  Rows: {len(merged_df)}")
    print(f"  Columns: {len(merged_df.columns)}")
    
    return filename


def main():
    """Main execution function."""
    print("="*60)
    print("WEATHER-MEDICINE DEMAND ANALYSIS")
    print("Single Medicine - Single Area (Auto-run)")
    print("="*60)
    print(f"\nConfigured for: {SELECTED_MEDICINE} in {SELECTED_AREA}")
    print("\n" + "="*60)
    
    # Load datasets
    medicine_df, weather_df = load_datasets()
    if medicine_df is None or weather_df is None:
        return
    
    # Standardize columns
    medicine_df, weather_df = standardize_columns(medicine_df, weather_df)
    
    # Convert dates
    medicine_df, weather_df = convert_dates(medicine_df, weather_df)
    
    # Clean area names
    medicine_df, weather_df = clean_area_names(medicine_df, weather_df)
    
    # Filter data
    filtered_df = filter_data(medicine_df, SELECTED_MEDICINE, SELECTED_AREA)
    if filtered_df is None or len(filtered_df) == 0:
        return
    
    # Merge with weather
    merged_df = merge_with_weather(filtered_df, weather_df)
    
    # Analyze correlations
    merged_df, correlations = analyze_correlations(merged_df, SELECTED_MEDICINE, SELECTED_AREA)
    
    # Save results
    filename = save_results(merged_df, SELECTED_MEDICINE, SELECTED_AREA)
    
    print("\n" + "="*60)
    print("✅ ANALYSIS COMPLETE!")
    print(f"Results saved to: {filename}")
    print("="*60)
    print("\n💡 To analyze a different medicine/area:")
    print("   Edit the SELECTED_MEDICINE and SELECTED_AREA variables at the top of this script.")


if __name__ == "__main__":
    main()
