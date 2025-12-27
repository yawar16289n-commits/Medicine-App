"""
Merge Weather and Medicine Sales Data - Single Medicine & Single Area
This script analyzes a specific medicine in a specific area with weather correlations.
"""

import pandas as pd
import numpy as np
import sys

def load_datasets():
    """Load both medicine sales and weather datasets."""
    print("Loading datasets...")
    
    # Load medicine sales data
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
                print("Error: Weather file not found.")
                return None, None
    
    return medicine_df, weather_df


def standardize_columns(medicine_df, weather_df):
    """Standardize column names for both datasets."""
    print("\nStandardizing column names...")
    
    # Standardize medicine dataset columns
    medicine_df.columns = medicine_df.columns.str.strip()
    
    # Date column
    date_variations = ['date', 'Date', 'DATE', 'Transaction Date', 'Sale Date']
    for col in medicine_df.columns:
        if col.strip().lower() in [v.lower() for v in date_variations]:
            medicine_df.rename(columns={col: 'Date'}, inplace=True)
            break
    
    # Area column
    area_variations = ['area', 'Area', 'AREA', 'City', 'city', 'Location', 'location', 'area in karachi']
    for col in medicine_df.columns:
        if col.strip().lower() in [v.lower() for v in area_variations]:
            medicine_df.rename(columns={col: 'Area'}, inplace=True)
            break
    
    # Units Sold column
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
    
    # Add Area to weather if missing
    if 'Area' not in weather_df.columns:
        weather_df['Area'] = 'karachi'
        print("  Note: Added 'karachi' as Area to weather data")
    
    return medicine_df, weather_df


def convert_dates(medicine_df, weather_df):
    """Convert Date columns to datetime format."""
    print("\nConverting dates to datetime format...")
    
    # Convert dates
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
    
    print("✓ Dates converted and normalized")
    
    return medicine_df, weather_df


def clean_area_names(medicine_df, weather_df):
    """Clean and standardize area/city names."""
    medicine_df['Area'] = medicine_df['Area'].astype(str).str.lower().str.strip()
    weather_df['Area'] = weather_df['Area'].astype(str).str.lower().str.strip()
    return medicine_df, weather_df


def select_medicine_and_area(medicine_df):
    """Let user select a medicine and area."""
    print("\n" + "="*60)
    print("AVAILABLE MEDICINES AND AREAS")
    print("="*60)
    
    # Get unique brand names
    brand_col = None
    for col in ['Brand Name', 'brand name', 'Medicine', 'Product']:
        if col in medicine_df.columns:
            brand_col = col
            break
    
    if brand_col is None:
        print("Error: Could not find medicine/brand column")
        return None, None, None
    
    unique_brands = sorted(medicine_df[brand_col].unique())
    print(f"\nAvailable Medicines ({len(unique_brands)}):")
    for i, brand in enumerate(unique_brands, 1):
        count = len(medicine_df[medicine_df[brand_col] == brand])
        print(f"  {i}. {brand} ({count} records)")
    
    # Get unique areas
    unique_areas = sorted(medicine_df['Area'].unique())
    print(f"\nAvailable Areas ({len(unique_areas)}):")
    for i, area in enumerate(unique_areas, 1):
        count = len(medicine_df[medicine_df['Area'] == area])
        print(f"  {i}. {area} ({count} records)")
    
    # Select medicine
    print("\n" + "="*60)
    while True:
        try:
            choice = input(f"Select medicine (1-{len(unique_brands)}) or enter name: ").strip()
            if choice.isdigit():
                idx = int(choice) - 1
                if 0 <= idx < len(unique_brands):
                    selected_medicine = unique_brands[idx]
                    break
            else:
                # Try to match by name
                matches = [b for b in unique_brands if choice.lower() in b.lower()]
                if len(matches) == 1:
                    selected_medicine = matches[0]
                    break
                elif len(matches) > 1:
                    print(f"Multiple matches found: {matches}. Please be more specific.")
                else:
                    print("No matches found. Try again.")
        except (ValueError, IndexError):
            print("Invalid input. Try again.")
    
    # Select area
    while True:
        try:
            choice = input(f"Select area (1-{len(unique_areas)}) or enter name: ").strip()
            if choice.isdigit():
                idx = int(choice) - 1
                if 0 <= idx < len(unique_areas):
                    selected_area = unique_areas[idx]
                    break
            else:
                # Try to match by name
                matches = [a for a in unique_areas if choice.lower() in a.lower()]
                if len(matches) == 1:
                    selected_area = matches[0]
                    break
                elif len(matches) > 1:
                    print(f"Multiple matches found: {matches}. Please be more specific.")
                else:
                    print("No matches found. Try again.")
        except (ValueError, IndexError):
            print("Invalid input. Try again.")
    
    print(f"\n✓ Selected: {selected_medicine} in {selected_area}")
    
    return selected_medicine, selected_area, brand_col


def filter_data(medicine_df, selected_medicine, selected_area, brand_col):
    """Filter dataset for selected medicine and area."""
    print("\n" + "="*60)
    print("FILTERING DATA")
    print("="*60)
    
    filtered_df = medicine_df[
        (medicine_df[brand_col] == selected_medicine) &
        (medicine_df['Area'] == selected_area)
    ].copy()
    
    print(f"Filtered records: {len(filtered_df)}")
    print(f"Date range: {filtered_df['Date'].min()} to {filtered_df['Date'].max()}")
    print(f"Units Sold range: {filtered_df['Units Sold'].min()} to {filtered_df['Units Sold'].max()}")
    
    if len(filtered_df) < 10:
        print("\nWarning: Very few records. Correlations may not be reliable.")
    
    return filtered_df


def merge_with_weather(filtered_df, weather_df):
    """Merge filtered medicine data with weather."""
    print("\n" + "="*60)
    print("MERGING WITH WEATHER DATA")
    print("="*60)
    
    # Drop Area from weather (city-wide data)
    weather_merge = weather_df.drop(columns=['Area'])
    
    # Merge on Date
    merged_df = filtered_df.merge(weather_merge, on='Date', how='left')
    
    # Count matches
    weather_cols = [col for col in weather_merge.columns if col != 'Date']
    rows_with_weather = merged_df[weather_cols[0]].notna().sum() if weather_cols else 0
    
    print(f"Total records: {len(merged_df)}")
    print(f"Records with weather data: {rows_with_weather} ({rows_with_weather/len(merged_df)*100:.1f}%)")
    
    if rows_with_weather == 0:
        print("\nWarning: No weather data matched! Check date ranges.")
    
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
    for col in merged_df.columns:
        col_lower = col.lower()
        if any(w in col_lower for w in ['temperature', 'temp', 'humidity', 'rainfall', 'rain', 'precipitation']):
            weather_cols.append(col)
    
    if not weather_cols:
        print("No weather columns found.")
        return
    
    print(f"\nWeather variables analyzed: {len(weather_cols)}")
    
    # Calculate correlations
    correlations = {}
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
            
            print(f"\n{weather_col}:")
            print(f"  Correlation: {correlation:.4f} ({strength} {direction})")
            print(f"  Valid observations: {len(valid_data)}")
        else:
            print(f"\n{weather_col}: Insufficient data ({len(valid_data)} observations)")
    
    # Summary statistics
    print(f"\n{'='*60}")
    print("SUMMARY STATISTICS")
    print(f"{'='*60}")
    
    print(f"\nUnits Sold:")
    print(f"  Count: {merged_df['Units Sold'].count()}")
    print(f"  Mean: {merged_df['Units Sold'].mean():.2f}")
    print(f"  Median: {merged_df['Units Sold'].median():.2f}")
    print(f"  Std Dev: {merged_df['Units Sold'].std():.2f}")
    print(f"  Min: {merged_df['Units Sold'].min():.0f}")
    print(f"  Max: {merged_df['Units Sold'].max():.0f}")
    
    for weather_col in weather_cols[:3]:  # Show top 3 weather variables
        if merged_df[weather_col].notna().any():
            print(f"\n{weather_col}:")
            print(f"  Mean: {merged_df[weather_col].mean():.2f}")
            print(f"  Median: {merged_df[weather_col].median():.2f}")
            print(f"  Min: {merged_df[weather_col].min():.2f}")
            print(f"  Max: {merged_df[weather_col].max():.2f}")
    
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
    print("Single Medicine - Single Area")
    print("="*60)
    
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
    
    # Select medicine and area
    selected_medicine, selected_area, brand_col = select_medicine_and_area(medicine_df)
    if selected_medicine is None or selected_area is None:
        return
    
    # Filter data
    filtered_df = filter_data(medicine_df, selected_medicine, selected_area, brand_col)
    
    if len(filtered_df) == 0:
        print("\nError: No records found for this combination.")
        return
    
    # Merge with weather
    merged_df = merge_with_weather(filtered_df, weather_df)
    
    # Analyze correlations
    merged_df, correlations = analyze_correlations(merged_df, selected_medicine, selected_area)
    
    # Save results
    filename = save_results(merged_df, selected_medicine, selected_area)
    
    print("\n" + "="*60)
    print("ANALYSIS COMPLETE!")
    print(f"Results saved to: {filename}")
    print("="*60)


if __name__ == "__main__":
    main()
