"""
Weather Impact Analysis - Single Medicine in Single Area
Alternative Approach: Shows ALL weather dates with zero-filled sales
This gives a complete picture of demand patterns vs weather conditions.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

# ============================================================
# CONFIGURATION
# ============================================================
SELECTED_MEDICINE = "Panadol"      # Change to analyze different medicine
SELECTED_AREA = "clifton"          # Change to analyze different area
# ============================================================


def load_datasets():
    """Load sales and weather datasets."""
    print("="*70)
    print("WEATHER IMPACT ANALYSIS - SINGLE MEDICINE & AREA")
    print("Alternative Approach: All dates with zero-filled sales")
    print("="*70)
    print(f"\nMedicine: {SELECTED_MEDICINE}")
    print(f"Area: {SELECTED_AREA}")
    print("\n" + "="*70)
    
    print("\n[1/10] Loading datasets...")
    
    # Load sales data
    try:
        sales_df = pd.read_excel('medicine_sales_25_medicines_2020_2024.xlsx')
        print("  ✓ Loaded medicine_sales_25_medicines_2020_2024.xlsx")
    except FileNotFoundError:
        try:
            sales_df = pd.read_excel('Med2023-2025.xlsx')
            print("  ✓ Loaded Med2023-2025.xlsx")
        except FileNotFoundError:
            print("  ✗ Error: Sales file not found")
            return None, None
    
    # Load weather data
    try:
        weather_df = pd.read_csv('weather.csv')
        print("  ✓ Loaded weather.csv")
    except FileNotFoundError:
        try:
            weather_df = pd.read_csv('karachi_weather_2023_2024_2.csv')
            print("  ✓ Loaded karachi_weather_2023_2024_2.csv")
        except FileNotFoundError:
            print("  ✗ Error: Weather file not found")
            return None, None
    
    print(f"\n  Sales shape: {sales_df.shape}")
    print(f"  Weather shape: {weather_df.shape}")
    
    return sales_df, weather_df


def standardize_column_names(df, dataset_name):
    """Standardize column names: lowercase with underscores."""
    print(f"\n[2/10] Standardizing {dataset_name} column names...")
    
    # Store original columns
    original_cols = list(df.columns)
    
    # Convert to lowercase and replace spaces with underscores
    df.columns = df.columns.str.lower().str.strip().str.replace(' ', '_').str.replace('/', '_')
    
    print(f"  Before: {original_cols[:5]}...")
    print(f"  After:  {list(df.columns)[:5]}...")
    
    return df


def convert_dates(sales_df, weather_df):
    """Convert Date columns to datetime format."""
    print("\n[3/10] Converting dates to datetime format...")
    
    # Find date column in sales
    date_col_sales = None
    for col in sales_df.columns:
        if 'date' in col.lower():
            date_col_sales = col
            break
    
    if date_col_sales:
        sales_df['date'] = pd.to_datetime(sales_df[date_col_sales], errors='coerce')
        if date_col_sales != 'date':
            sales_df = sales_df.drop(columns=[date_col_sales])
        print(f"  ✓ Sales dates converted ({date_col_sales} → date)")
    
    # Find date column in weather
    date_col_weather = None
    for col in weather_df.columns:
        if 'date' in col.lower():
            date_col_weather = col
            break
    
    if date_col_weather:
        weather_df['date'] = pd.to_datetime(weather_df[date_col_weather], errors='coerce')
        if date_col_weather != 'date':
            weather_df = weather_df.drop(columns=[date_col_weather])
        print(f"  ✓ Weather dates converted ({date_col_weather} → date)")
    
    # Remove timezone and normalize
    if weather_df['date'].dt.tz is not None:
        weather_df['date'] = weather_df['date'].dt.tz_localize(None)
    if sales_df['date'].dt.tz is not None:
        sales_df['date'] = sales_df['date'].dt.tz_localize(None)
    
    sales_df['date'] = sales_df['date'].dt.normalize()
    weather_df['date'] = weather_df['date'].dt.normalize()
    
    # Remove invalid dates
    sales_df = sales_df.dropna(subset=['date'])
    weather_df = weather_df.dropna(subset=['date'])
    
    print(f"  Sales date range: {sales_df['date'].min().date()} to {sales_df['date'].max().date()}")
    print(f"  Weather date range: {weather_df['date'].min().date()} to {weather_df['date'].max().date()}")
    
    return sales_df, weather_df


def clean_area_names(sales_df, weather_df):
    """Clean area/city names: lowercase and strip spaces."""
    print("\n[4/10] Cleaning area names...")
    
    # Find area column in sales
    area_col_sales = None
    for col in sales_df.columns:
        if 'area' in col.lower() or 'city' in col.lower() or 'location' in col.lower():
            area_col_sales = col
            break
    
    if area_col_sales:
        sales_df['area'] = sales_df[area_col_sales].astype(str).str.lower().str.strip()
        if area_col_sales != 'area':
            sales_df = sales_df.drop(columns=[area_col_sales])
        print(f"  ✓ Sales areas cleaned ({area_col_sales} → area)")
    
    # Find area column in weather
    area_col_weather = None
    for col in weather_df.columns:
        if 'area' in col.lower() or 'city' in col.lower() or 'location' in col.lower():
            area_col_weather = col
            break
    
    if area_col_weather:
        weather_df['area'] = weather_df[area_col_weather].astype(str).str.lower().str.strip()
        if area_col_weather != 'area':
            weather_df = weather_df.drop(columns=[area_col_weather])
        print(f"  ✓ Weather areas cleaned ({area_col_weather} → area)")
    else:
        # If no area column, assume city-wide data
        weather_df['area'] = 'karachi'
        print(f"  ✓ Weather area set to 'karachi' (city-wide data)")
    
    return sales_df, weather_df


def filter_sales_data(sales_df, medicine, area):
    """Filter sales for specific medicine and area."""
    print(f"\n[5/10] Filtering sales data...")
    print(f"  Medicine: {medicine}")
    print(f"  Area: {area}")
    
    # Find brand/medicine column
    brand_col = None
    for col in sales_df.columns:
        if 'brand' in col.lower() or 'medicine' in col.lower() or 'product' in col.lower():
            brand_col = col
            break
    
    if brand_col is None:
        print("  ✗ Error: Could not find medicine/brand column")
        return None
    
    # Find units sold column
    units_col = None
    for col in sales_df.columns:
        if 'units' in col.lower() or 'quantity' in col.lower() or 'qty' in col.lower():
            units_col = col
            break
    
    if units_col:
        sales_df['units_sold'] = sales_df[units_col]
        if units_col != 'units_sold':
            sales_df = sales_df.drop(columns=[units_col])
    
    # Filter
    filtered_sales = sales_df[
        (sales_df[brand_col].str.lower() == medicine.lower()) &
        (sales_df['area'] == area.lower())
    ].copy()
    
    print(f"  Original records: {len(sales_df)}")
    print(f"  Filtered records: {len(filtered_sales)}")
    
    if len(filtered_sales) == 0:
        print("\n  ✗ No sales records found for this medicine/area combination!")
        print(f"\n  Available medicines: {sorted(sales_df[brand_col].unique())[:10]}")
        print(f"\n  Available areas: {sorted(sales_df['area'].unique())}")
        return None
    
    print(f"  Date range: {filtered_sales['date'].min().date()} to {filtered_sales['date'].max().date()}")
    print(f"  Total units sold: {filtered_sales['units_sold'].sum():.0f}")
    
    return filtered_sales


def filter_weather_data(weather_df, area, sales_df):
    """Filter weather for the same area and date range."""
    print(f"\n[6/10] Filtering weather data...")
    
    # Get date range from sales
    min_date = sales_df['date'].min()
    max_date = sales_df['date'].max()
    
    # Check if weather has area and if it matches the target area
    if 'area' in weather_df.columns:
        unique_areas = weather_df['area'].unique()
        print(f"  Weather areas available: {unique_areas}")
        
        # If target area exists in weather data, filter by it
        if area.lower() in weather_df['area'].values:
            filtered_weather = weather_df[weather_df['area'] == area.lower()].copy()
            print(f"  ✓ Filtered by area: {area}")
        else:
            # If target area not in weather, use all data (city-wide)
            filtered_weather = weather_df.copy()
            print(f"  ℹ Area '{area}' not in weather data. Using city-wide weather.")
    else:
        # Use all weather data (city-wide)
        filtered_weather = weather_df.copy()
        print(f"  ℹ Using city-wide weather data (no area column)")
    
    # Filter by date range
    filtered_weather = filtered_weather[
        (filtered_weather['date'] >= min_date) &
        (filtered_weather['date'] <= max_date)
    ].copy()
    
    print(f"  Weather records: {len(filtered_weather)}")
    if len(filtered_weather) > 0:
        print(f"  Date range: {filtered_weather['date'].min().date()} to {filtered_weather['date'].max().date()}")
    else:
        print(f"  ⚠ Warning: No weather data in sales date range!")
    
    return filtered_weather


def create_full_date_range(sales_df, weather_df):
    """Create complete date range with zero-filled sales."""
    print(f"\n[7/10] Creating complete date range with zero-filled sales...")
    
    # Get the overlapping date range
    min_date = max(sales_df['date'].min(), weather_df['date'].min())
    max_date = min(sales_df['date'].max(), weather_df['date'].max())
    
    print(f"  Overlapping date range: {min_date.date()} to {max_date.date()}")
    
    # Create complete date range
    date_range = pd.date_range(start=min_date, end=max_date, freq='D')
    full_df = pd.DataFrame({'date': date_range})
    
    print(f"  Total days in range: {len(full_df)}")
    
    # Aggregate sales by date (sum units if multiple transactions per day)
    sales_agg = sales_df.groupby('date')['units_sold'].sum().reset_index()
    
    # Merge with full date range (left join keeps all dates)
    full_df = full_df.merge(sales_agg, on='date', how='left')
    
    # Fill missing sales with 0
    full_df['units_sold'] = full_df['units_sold'].fillna(0)
    
    # Count sale days
    sale_days = (full_df['units_sold'] > 0).sum()
    print(f"  Days with sales: {sale_days}")
    print(f"  Days without sales: {len(full_df) - sale_days}")
    
    # Merge with weather
    full_df = full_df.merge(weather_df, on='date', how='left')
    
    # Count weather coverage
    weather_cols = [col for col in weather_df.columns if col != 'date' and col != 'area']
    if weather_cols:
        weather_coverage = full_df[weather_cols[0]].notna().sum()
        print(f"  Days with weather data: {weather_coverage}")
    
    return full_df


def identify_weather_columns(df):
    """Identify temperature, humidity, and rainfall columns."""
    print(f"\n[8/10] Identifying weather variables...")
    
    weather_vars = {
        'temperature': None,
        'humidity': None,
        'rainfall': None
    }
    
    for col in df.columns:
        col_lower = col.lower()
        
        # Temperature
        if weather_vars['temperature'] is None:
            if 'temperature' in col_lower or 'temp' in col_lower:
                if 'mean' in col_lower or 'avg' in col_lower or ('min' not in col_lower and 'max' not in col_lower):
                    weather_vars['temperature'] = col
        
        # Humidity
        if weather_vars['humidity'] is None:
            if 'humidity' in col_lower or 'humid' in col_lower:
                if 'mean' in col_lower or 'avg' in col_lower or ('min' not in col_lower and 'max' not in col_lower):
                    weather_vars['humidity'] = col
        
        # Rainfall
        if weather_vars['rainfall'] is None:
            if 'rain' in col_lower or 'precip' in col_lower:
                if 'sum' in col_lower or 'total' in col_lower or 'amount' in col_lower:
                    weather_vars['rainfall'] = col
    
    print(f"  Temperature column: {weather_vars['temperature']}")
    print(f"  Humidity column: {weather_vars['humidity']}")
    print(f"  Rainfall column: {weather_vars['rainfall']}")
    
    return weather_vars


def calculate_correlations(df, weather_vars):
    """Calculate correlations between units sold and weather variables."""
    print(f"\n[9/10] Calculating correlations...")
    
    correlations = {}
    
    for var_name, col_name in weather_vars.items():
        if col_name and col_name in df.columns:
            # Remove rows with missing data
            valid_data = df[['units_sold', col_name]].dropna()
            
            if len(valid_data) > 2:
                corr = valid_data['units_sold'].corr(valid_data[col_name])
                correlations[var_name] = corr
                
                # Interpret
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
                
                direction = "positive" if corr > 0 else "negative"
                
                print(f"\n  {var_name.capitalize()}:")
                print(f"    Correlation: {corr:.4f} ({strength} {direction})")
                print(f"    Valid observations: {len(valid_data)}")
    
    return correlations


def create_plots(df, weather_vars, medicine, area):
    """Create visualization plots."""
    print(f"\n[10/10] Creating visualizations...")
    
    # Set style
    sns.set_style("whitegrid")
    plt.rcParams['figure.figsize'] = (15, 10)
    
    # Count available plots
    available_vars = [v for v in weather_vars.values() if v and v in df.columns]
    n_plots = len(available_vars)
    
    if n_plots == 0:
        print("  ✗ No weather variables available for plotting")
        return None
    
    # Create subplots
    fig, axes = plt.subplots(n_plots, 1, figsize=(15, 5*n_plots))
    
    if n_plots == 1:
        axes = [axes]
    
    plot_idx = 0
    
    # Plot each weather variable
    for var_name, col_name in weather_vars.items():
        if col_name and col_name in df.columns:
            ax = axes[plot_idx]
            
            # Remove missing data
            plot_data = df[['date', 'units_sold', col_name]].dropna()
            
            if len(plot_data) > 0:
                # Create twin axis
                ax2 = ax.twinx()
                
                # Plot units sold as bars
                ax.bar(plot_data['date'], plot_data['units_sold'], 
                       alpha=0.6, color='steelblue', label='Units Sold')
                
                # Plot weather variable as line
                ax2.plot(plot_data['date'], plot_data[col_name], 
                        color='orangered', linewidth=2, marker='o', 
                        markersize=4, label=col_name)
                
                # Labels
                ax.set_xlabel('Date', fontsize=12, fontweight='bold')
                ax.set_ylabel('Units Sold', fontsize=12, fontweight='bold', color='steelblue')
                ax2.set_ylabel(col_name.replace('_', ' ').title(), 
                              fontsize=12, fontweight='bold', color='orangered')
                
                # Title
                title = f'{medicine} Sales in {area.title()} vs {var_name.capitalize()}'
                ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
                
                # Legends
                ax.legend(loc='upper left', fontsize=10)
                ax2.legend(loc='upper right', fontsize=10)
                
                # Grid
                ax.grid(True, alpha=0.3)
                
                # Rotate x-axis labels
                ax.tick_params(axis='x', rotation=45)
                
                plot_idx += 1
    
    plt.tight_layout()
    
    # Save plot
    filename = f"weather_impact_{medicine.lower()}_{area.lower()}.png"
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    print(f"  ✓ Plot saved: {filename}")
    
    # Show plot
    plt.show()
    
    return filename


def save_results(df, medicine, area):
    """Save merged dataset to CSV."""
    print(f"\n{'='*70}")
    print("SAVING RESULTS")
    print(f"{'='*70}")
    
    filename = "medicine_weather_single.csv"
    df.to_csv(filename, index=False)
    
    print(f"\n✓ Saved: {filename}")
    print(f"  Total rows: {len(df)}")
    print(f"  Columns: {len(df.columns)}")
    print(f"  Days with sales: {(df['units_sold'] > 0).sum()}")
    print(f"  Days without sales: {(df['units_sold'] == 0).sum()}")
    print(f"  Total units sold: {df['units_sold'].sum():.0f}")
    
    return filename


def print_summary(df, correlations, medicine, area):
    """Print analysis summary."""
    print(f"\n{'='*70}")
    print("ANALYSIS SUMMARY")
    print(f"{'='*70}")
    
    print(f"\nMedicine: {medicine}")
    print(f"Area: {area}")
    print(f"\nDate Range: {df['date'].min().date()} to {df['date'].max().date()}")
    print(f"Total Days: {len(df)}")
    print(f"Days with Sales: {(df['units_sold'] > 0).sum()}")
    print(f"Sales Frequency: {(df['units_sold'] > 0).sum() / len(df) * 100:.1f}%")
    
    print(f"\n📊 Sales Statistics:")
    print(f"   Total Units Sold: {df['units_sold'].sum():.0f}")
    print(f"   Average Daily Sales: {df['units_sold'].mean():.2f}")
    print(f"   Max Daily Sales: {df['units_sold'].max():.0f}")
    print(f"   Days with Zero Sales: {(df['units_sold'] == 0).sum()}")
    
    if correlations:
        print(f"\n🌡️  Weather Correlations:")
        for var, corr in correlations.items():
            print(f"   {var.capitalize()}: {corr:+.4f}")
    
    print(f"\n{'='*70}")


def main():
    """Main execution function."""
    # Load data
    sales_df, weather_df = load_datasets()
    if sales_df is None or weather_df is None:
        return
    
    # Standardize column names
    sales_df = standardize_column_names(sales_df, "sales")
    weather_df = standardize_column_names(weather_df, "weather")
    
    # Convert dates
    sales_df, weather_df = convert_dates(sales_df, weather_df)
    
    # Clean area names
    sales_df, weather_df = clean_area_names(sales_df, weather_df)
    
    # Filter sales
    filtered_sales = filter_sales_data(sales_df, SELECTED_MEDICINE, SELECTED_AREA)
    if filtered_sales is None:
        return
    
    # Filter weather
    filtered_weather = filter_weather_data(weather_df, SELECTED_AREA, filtered_sales)
    
    # Create full date range with zero-filled sales
    full_df = create_full_date_range(filtered_sales, filtered_weather)
    
    # Identify weather columns
    weather_vars = identify_weather_columns(full_df)
    
    # Calculate correlations
    correlations = calculate_correlations(full_df, weather_vars)
    
    # Create plots
    plot_file = create_plots(full_df, weather_vars, SELECTED_MEDICINE, SELECTED_AREA)
    
    # Save results
    csv_file = save_results(full_df, SELECTED_MEDICINE, SELECTED_AREA)
    
    # Print summary
    print_summary(full_df, correlations, SELECTED_MEDICINE, SELECTED_AREA)
    
    print("\n✅ ANALYSIS COMPLETE!")
    print(f"\nOutput files:")
    print(f"  - {csv_file}")
    if plot_file:
        print(f"  - {plot_file}")


if __name__ == "__main__":
    main()
