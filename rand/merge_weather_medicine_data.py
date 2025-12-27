"""
Merge Weather and Medicine Sales Data
This script merges weather data with medicine sales data for demand analysis.
"""

import pandas as pd
import numpy as np
from pathlib import Path

def load_datasets():
    """Load both medicine sales and weather datasets."""
    print("Loading datasets...")
    
    # Load medicine sales data
    # Assuming the file is Med2023-2025.xlsx or medicine_sales_25_medicines_2020_2024.xlsx
    try:
        medicine_df = pd.read_excel('medicine_sales_25_medicines_2020_2024.xlsx')
        print("✓ Loaded medicine_sales_25_medicines_2020_2024.xlsx")
    except FileNotFoundError:
        try:
            medicine_df = pd.read_excel('Med2023-2025.xlsx')
            print("✓ Loaded Med2023-2025.xlsx")
        except FileNotFoundError:
            print("Error: Medicine sales file not found. Please ensure the file exists.")
            return None, None
    
    # Load weather data
    try:
        weather_df = pd.read_csv('weather.csv')
        print("✓ Loaded weather.csv")
    except FileNotFoundError:
        try:
            weather_df = pd.read_csv('karachi_weather_2023_2024_2.csv')
            print("✓ Loaded karachi_weather_2023_2024_2.csv")
        except FileNotFoundError:
            try:
                weather_df = pd.read_excel('weather.xlsx')
                print("✓ Loaded weather.xlsx")
            except FileNotFoundError:
                print("Error: Weather file not found. Please ensure the file exists.")
                return None, None
    
    print(f"\nMedicine dataset shape: {medicine_df.shape}")
    print(f"Weather dataset shape: {weather_df.shape}")
    print(f"\nMedicine columns: {list(medicine_df.columns)}")
    print(f"Weather columns: {list(weather_df.columns)}")
    
    return medicine_df, weather_df


def standardize_columns(medicine_df, weather_df):
    """Standardize column names for both datasets."""
    print("\n" + "="*60)
    print("Standardizing column names...")
    
    # Standardize medicine dataset columns
    medicine_df.columns = medicine_df.columns.str.strip()
    
    # Common variations for Date column
    date_variations = ['date', 'Date', 'DATE', 'Transaction Date', 'Sale Date']
    for col in medicine_df.columns:
        if col.strip().lower() in [v.lower() for v in date_variations]:
            medicine_df.rename(columns={col: 'Date'}, inplace=True)
            break
    
    # Common variations for Area column
    area_variations = ['area', 'Area', 'AREA', 'City', 'city', 'Location', 'location', 'area in karachi']
    for col in medicine_df.columns:
        if col.strip().lower() in [v.lower() for v in area_variations]:
            medicine_df.rename(columns={col: 'Area'}, inplace=True)
            break
    
    # Handle Units Sold variations
    units_variations = ['units sold', 'quantity', 'units', 'sales', 'qty']
    for col in medicine_df.columns:
        if col.strip().lower() in [v.lower() for v in units_variations]:
            medicine_df.rename(columns={col: 'Units Sold'}, inplace=True)
            break
    
    # Standardize weather dataset columns
    weather_df.columns = weather_df.columns.str.strip()
    
    for col in weather_df.columns:
        if col.strip().lower() in [v.lower() for v in date_variations]:
            weather_df.rename(columns={col: 'Date'}, inplace=True)
            break
    
    # If weather dataset doesn't have Area column, assume it's all for one area (e.g., Karachi)
    if 'Area' not in weather_df.columns:
        for col in weather_df.columns:
            if col.strip().lower() in [v.lower() for v in area_variations]:
                weather_df.rename(columns={col: 'Area'}, inplace=True)
                break
        
        # If still no Area column, add a default one
        if 'Area' not in weather_df.columns:
            weather_df['Area'] = 'karachi'
            print("  Note: Weather dataset has no Area column. Assuming all data is for 'karachi'.")
    
    print(f"✓ Medicine columns after standardization: {list(medicine_df.columns)}")
    print(f"✓ Weather columns after standardization: {list(weather_df.columns)}")
    
    return medicine_df, weather_df


def convert_dates(medicine_df, weather_df):
    """Convert Date columns to datetime format."""
    print("\n" + "="*60)
    print("Converting dates to datetime format...")
    
    # Convert medicine dataset dates
    medicine_df['Date'] = pd.to_datetime(medicine_df['Date'], errors='coerce')
    print(f"✓ Medicine dates converted. Date range: {medicine_df['Date'].min()} to {medicine_df['Date'].max()}")
    
    # Convert weather dataset dates
    weather_df['Date'] = pd.to_datetime(weather_df['Date'], errors='coerce')
    
    # Remove timezone information to ensure compatibility
    if weather_df['Date'].dt.tz is not None:
        weather_df['Date'] = weather_df['Date'].dt.tz_localize(None)
        print("  Note: Removed timezone information from weather dates")
    
    if medicine_df['Date'].dt.tz is not None:
        medicine_df['Date'] = medicine_df['Date'].dt.tz_localize(None)
        print("  Note: Removed timezone information from medicine dates")
    
    print(f"✓ Weather dates converted. Date range: {weather_df['Date'].min()} to {weather_df['Date'].max()}")
    
    # Normalize dates to remove time component (set to midnight)
    medicine_df['Date'] = medicine_df['Date'].dt.normalize()
    weather_df['Date'] = weather_df['Date'].dt.normalize()
    print("✓ Normalized dates to midnight (removed time component)")
    
    # Remove rows with invalid dates
    medicine_df = medicine_df.dropna(subset=['Date'])
    weather_df = weather_df.dropna(subset=['Date'])
    
    print(f"✓ Rows with invalid dates removed")
    
    return medicine_df, weather_df


def clean_area_names(medicine_df, weather_df):
    """Clean and standardize area/city names."""
    print("\n" + "="*60)
    print("Cleaning area/city names...")
    
    # Clean medicine dataset area names
    medicine_df['Area'] = medicine_df['Area'].astype(str).str.lower().str.strip()
    print(f"✓ Medicine areas cleaned. Unique areas: {medicine_df['Area'].nunique()}")
    print(f"  Areas: {sorted(medicine_df['Area'].unique())[:10]}")  # Show first 10
    
    # Clean weather dataset area names
    weather_df['Area'] = weather_df['Area'].astype(str).str.lower().str.strip()
    print(f"✓ Weather areas cleaned. Unique areas: {weather_df['Area'].nunique()}")
    print(f"  Areas: {sorted(weather_df['Area'].unique())}")
    
    return medicine_df, weather_df


def fill_missing_weather(weather_df):
    """Forward-fill missing weather values by Area."""
    print("\n" + "="*60)
    print("Handling missing weather data...")
    
    # Identify weather columns (excluding Date and Area)
    weather_cols = [col for col in weather_df.columns if col not in ['Date', 'Area']]
    
    print(f"Weather columns to process: {weather_cols}")
    
    # Check missing values before
    missing_before = weather_df[weather_cols].isnull().sum()
    print(f"\nMissing values before forward-fill:")
    for col in weather_cols:
        if missing_before[col] > 0:
            print(f"  {col}: {missing_before[col]} ({missing_before[col]/len(weather_df)*100:.2f}%)")
    
    # Sort by Area and Date before forward-filling
    weather_df = weather_df.sort_values(['Area', 'Date'])
    
    # Forward-fill by Area
    weather_df[weather_cols] = weather_df.groupby('Area')[weather_cols].ffill()
    
    # Check missing values after
    missing_after = weather_df[weather_cols].isnull().sum()
    print(f"\n✓ Forward-fill completed. Missing values after:")
    for col in weather_cols:
        if missing_after[col] > 0:
            print(f"  {col}: {missing_after[col]} ({missing_after[col]/len(weather_df)*100:.2f}%)")
        else:
            print(f"  {col}: 0 (all filled)")
    
    return weather_df


def merge_datasets(medicine_df, weather_df):
    """Merge medicine and weather datasets on Date and Area."""
    print("\n" + "="*60)
    print("Merging datasets...")
    
    print(f"Medicine dataset: {len(medicine_df)} rows")
    print(f"Weather dataset: {len(weather_df)} rows")
    
    # Debug: Show sample dates
    print(f"\nSample medicine dates:")
    print(f"  {medicine_df['Date'].head(3).tolist()}")
    print(f"\nSample weather dates:")
    print(f"  {weather_df['Date'].head(3).tolist()}")
    
    # Check overlap
    medicine_dates = set(medicine_df['Date'])
    weather_dates = set(weather_df['Date'])
    overlap = medicine_dates.intersection(weather_dates)
    print(f"\nDate overlap: {len(overlap)} matching dates out of {len(medicine_dates)} medicine dates")
    
    # Check if we need to merge on Date only (when weather is city-wide but medicine has neighborhoods)
    medicine_areas = set(medicine_df['Area'].unique())
    weather_areas = set(weather_df['Area'].unique())
    
    # If weather has only one area or different areas than medicine, merge on Date only
    if len(weather_areas) == 1 or not medicine_areas.intersection(weather_areas):
        print(f"\n  Note: Weather data is city-wide. Merging on Date only.")
        print(f"  Medicine areas: {sorted(list(medicine_areas))[:5]}...")
        print(f"  Weather areas: {sorted(list(weather_areas))}")
        
        # Drop Area from weather before merging to avoid duplication
        weather_merge = weather_df.drop(columns=['Area'])
        
        # Perform left join on Date only
        merged_df = medicine_df.merge(
            weather_merge,
            on='Date',
            how='left'
        )
    else:
        # Perform left join on both Date and Area
        merged_df = medicine_df.merge(
            weather_df,
            on=['Date', 'Area'],
            how='left'
        )
    
    print(f"\n✓ Merged dataset: {len(merged_df)} rows")
    
    # Check how many rows have weather data
    weather_cols = [col for col in weather_df.columns if col not in ['Date', 'Area']]
    rows_with_weather = merged_df[weather_cols[0]].notna().sum() if weather_cols else 0
    print(f"✓ Rows with weather data: {rows_with_weather} ({rows_with_weather/len(merged_df)*100:.2f}%)")
    
    return merged_df


def save_merged_data(merged_df, output_file='sales_weather_merged.csv'):
    """Save merged dataset to CSV."""
    print("\n" + "="*60)
    print(f"Saving merged data to {output_file}...")
    
    merged_df.to_csv(output_file, index=False)
    print(f"✓ File saved successfully!")
    print(f"  Output file: {output_file}")
    print(f"  Total rows: {len(merged_df)}")
    print(f"  Total columns: {len(merged_df.columns)}")
    
    return output_file


def analyze_correlations(merged_df):
    """Calculate and display correlations between Units Sold and weather variables."""
    print("\n" + "="*60)
    print("CORRELATION ANALYSIS")
    print("="*60)
    
    # Identify relevant columns
    units_col = None
    for col in merged_df.columns:
        if 'units' in col.lower() and 'sold' in col.lower():
            units_col = col
            break
    
    if units_col is None:
        # Try alternative names
        for col in merged_df.columns:
            if 'quantity' in col.lower() or 'sales' in col.lower() or 'units' in col.lower():
                units_col = col
                break
    
    if units_col is None:
        print("Warning: Could not find 'Units Sold' column. Available columns:")
        print(list(merged_df.columns))
        return
    
    print(f"\nAnalyzing correlations with '{units_col}'...")
    
    # Identify weather columns
    weather_cols = []
    for col in merged_df.columns:
        col_lower = col.lower()
        if any(weather in col_lower for weather in ['temperature', 'temp', 'humidity', 'rainfall', 'rain', 'wind', 'pressure']):
            weather_cols.append(col)
    
    if not weather_cols:
        print("Warning: No weather columns found in merged dataset.")
        return
    
    print(f"Weather columns found: {weather_cols}")
    
    # Calculate correlations
    print(f"\n{'='*60}")
    print(f"CORRELATIONS WITH {units_col.upper()}")
    print(f"{'='*60}")
    
    correlations = {}
    for weather_col in weather_cols:
        # Remove rows where either column is missing
        valid_data = merged_df[[units_col, weather_col]].dropna()
        
        if len(valid_data) > 0:
            correlation = valid_data[units_col].corr(valid_data[weather_col])
            correlations[weather_col] = correlation
            
            # Interpret correlation strength
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
            
            print(f"\n{weather_col}:")
            print(f"  Correlation: {correlation:.4f} ({strength} {direction})")
            print(f"  Valid observations: {len(valid_data)}")
        else:
            print(f"\n{weather_col}: No valid data for correlation")
    
    # Summary statistics
    print(f"\n{'='*60}")
    print("SUMMARY STATISTICS")
    print(f"{'='*60}")
    
    print(f"\n{units_col}:")
    print(f"  Mean: {merged_df[units_col].mean():.2f}")
    print(f"  Median: {merged_df[units_col].median():.2f}")
    print(f"  Std Dev: {merged_df[units_col].std():.2f}")
    print(f"  Min: {merged_df[units_col].min():.2f}")
    print(f"  Max: {merged_df[units_col].max():.2f}")
    
    for weather_col in weather_cols:
        if merged_df[weather_col].notna().any():
            print(f"\n{weather_col}:")
            print(f"  Mean: {merged_df[weather_col].mean():.2f}")
            print(f"  Median: {merged_df[weather_col].median():.2f}")
            print(f"  Std Dev: {merged_df[weather_col].std():.2f}")
            print(f"  Min: {merged_df[weather_col].min():.2f}")
            print(f"  Max: {merged_df[weather_col].max():.2f}")
    
    return correlations


def main():
    """Main execution function."""
    print("="*60)
    print("WEATHER-MEDICINE DEMAND ANALYSIS")
    print("Merging Sales and Weather Datasets")
    print("="*60)
    
    # Step 1: Load datasets
    medicine_df, weather_df = load_datasets()
    if medicine_df is None or weather_df is None:
        print("\nExiting due to file loading errors.")
        return
    
    # Step 2: Standardize column names
    medicine_df, weather_df = standardize_columns(medicine_df, weather_df)
    
    # Step 3: Convert dates to datetime
    medicine_df, weather_df = convert_dates(medicine_df, weather_df)
    
    # Step 4: Clean area/city names
    medicine_df, weather_df = clean_area_names(medicine_df, weather_df)
    
    # Step 5: Forward-fill missing weather values
    weather_df = fill_missing_weather(weather_df)
    
    # Step 6: Merge datasets
    merged_df = merge_datasets(medicine_df, weather_df)
    
    # Step 7: Save merged data
    output_file = save_merged_data(merged_df)
    
    # Step 8: Analyze correlations
    analyze_correlations(merged_df)
    
    print("\n" + "="*60)
    print("PROCESS COMPLETE!")
    print(f"Merged data saved to: {output_file}")
    print("="*60)


if __name__ == "__main__":
    main()
