"""
Medicine Sales Mapping Analysis - WITHOUT Weather Influence
Pure sales pattern analysis for a single medicine in a single area
Shows temporal patterns, trends, and sales statistics
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime

# Configuration
SELECTED_MEDICINE = "Diflucan"
SELECTED_AREA = "pechs"

print("="*70)
print("MEDICINE SALES MAPPING ANALYSIS (NO WEATHER)")
print("="*70)
print(f"\nMedicine: {SELECTED_MEDICINE}")
print(f"Area: {SELECTED_AREA}")
print("="*70)

# Load data
print("\n[1] Loading sales data...")
sales_df = pd.read_excel('Med2023-2025.xlsx')
print(f"    Total records: {len(sales_df)}")

# Standardize columns
sales_df.columns = sales_df.columns.str.lower().str.strip().str.replace(' ', '_')

# Convert dates
sales_df['date'] = pd.to_datetime(sales_df['date'], errors='coerce').dt.normalize()

# Clean areas
for col in sales_df.columns:
    if 'area' in col:
        sales_df['area'] = sales_df[col].str.lower().str.strip()
        break

# Rename units column
for col in sales_df.columns:
    if 'quantity' in col or 'units' in col:
        sales_df['units_sold'] = sales_df[col]
        break

# Filter for specific medicine and area
print(f"\n[2] Filtering for {SELECTED_MEDICINE} in {SELECTED_AREA}...")
brand_col = [c for c in sales_df.columns if 'brand' in c][0]
filtered_df = sales_df[
    (sales_df[brand_col].str.lower() == SELECTED_MEDICINE.lower()) &
    (sales_df['area'] == SELECTED_AREA.lower())
].copy()

print(f"    Filtered records: {len(filtered_df)}")

if len(filtered_df) == 0:
    print("    ERROR: No records found!")
    exit()

# Sort by date
filtered_df = filtered_df.sort_values('date')

print(f"\n[3] Sales period analysis...")
print(f"    First sale: {filtered_df['date'].min().date()}")
print(f"    Last sale: {filtered_df['date'].max().date()}")
print(f"    Total days span: {(filtered_df['date'].max() - filtered_df['date'].min()).days} days")
print(f"    Total transactions: {len(filtered_df)}")
print(f"    Total units sold: {filtered_df['units_sold'].sum():.0f}")

# Calculate time between sales
filtered_df['days_since_last_sale'] = filtered_df['date'].diff().dt.days

print(f"\n[4] Sales frequency analysis...")
print(f"    Average days between sales: {filtered_df['days_since_last_sale'].mean():.1f}")
print(f"    Median days between sales: {filtered_df['days_since_last_sale'].median():.1f}")
print(f"    Min days between sales: {filtered_df['days_since_last_sale'].min():.0f}")
print(f"    Max days between sales: {filtered_df['days_since_last_sale'].max():.0f}")

# Sales statistics
print(f"\n[5] Units sold per transaction...")
print(f"    Mean: {filtered_df['units_sold'].mean():.2f} units")
print(f"    Median: {filtered_df['units_sold'].median():.0f} units")
print(f"    Std Dev: {filtered_df['units_sold'].std():.2f}")
print(f"    Min: {filtered_df['units_sold'].min():.0f} units")
print(f"    Max: {filtered_df['units_sold'].max():.0f} units")

# Monthly aggregation
filtered_df['year_month'] = filtered_df['date'].dt.to_period('M')
monthly_sales = filtered_df.groupby('year_month').agg({
    'units_sold': ['sum', 'count', 'mean']
}).reset_index()
monthly_sales.columns = ['year_month', 'total_units', 'num_transactions', 'avg_units_per_transaction']
monthly_sales['year_month_str'] = monthly_sales['year_month'].astype(str)

print(f"\n[6] Monthly sales summary...")
print(f"\n{'Month':<12}{'Transactions':>14}{'Total Units':>14}{'Avg/Transaction':>18}")
print("-"*70)
for _, row in monthly_sales.iterrows():
    print(f"{row['year_month_str']:<12}{row['num_transactions']:>14.0f}{row['total_units']:>14.0f}{row['avg_units_per_transaction']:>18.2f}")

# Check for formulation/dosage variations
if 'generic___formula_name' in filtered_df.columns:
    formulations = filtered_df['generic___formula_name'].value_counts()
    print(f"\n[7] Formulation variations...")
    for form, count in formulations.items():
        print(f"    {form}: {count} transactions")

if 'dosage___strength' in filtered_df.columns:
    dosages = filtered_df['dosage___strength'].value_counts()
    print(f"\n[8] Dosage variations...")
    for dosage, count in dosages.items():
        print(f"    {dosage}: {count} transactions")

# Seasonal pattern
filtered_df['month'] = filtered_df['date'].dt.month
filtered_df['month_name'] = filtered_df['date'].dt.strftime('%B')
seasonal = filtered_df.groupby(['month', 'month_name']).agg({
    'units_sold': ['sum', 'count']
}).reset_index()
seasonal.columns = ['month', 'month_name', 'total_units', 'transactions']
seasonal = seasonal.sort_values('month')

print(f"\n[9] Seasonal pattern (by month)...")
print(f"\n{'Month':<12}{'Transactions':>14}{'Total Units':>14}")
print("-"*50)
for _, row in seasonal.iterrows():
    print(f"{row['month_name']:<12}{row['transactions']:>14.0f}{row['total_units']:>14.0f}")

# Save detailed transaction data
output_file = f"medicine_sales_mapping_{SELECTED_MEDICINE.lower()}_{SELECTED_AREA.lower()}.csv"
filtered_df.to_csv(output_file, index=False)
print(f"\n[10] Saved detailed transaction data...")
print(f"    File: {output_file}")
print(f"    Rows: {len(filtered_df)}")
print(f"    Columns: {len(filtered_df.columns)}")

# Create visualizations
print(f"\n[11] Creating visualizations...")

fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))

# Plot 1: Sales over time (timeline)
ax1.plot(filtered_df['date'], filtered_df['units_sold'], marker='o', linestyle='-', 
         linewidth=2, markersize=8, color='steelblue')
ax1.fill_between(filtered_df['date'], filtered_df['units_sold'], alpha=0.3, color='steelblue')
ax1.set_xlabel('Date', fontsize=11, fontweight='bold')
ax1.set_ylabel('Units Sold', fontsize=11, fontweight='bold')
ax1.set_title(f'{SELECTED_MEDICINE} Sales Timeline in {SELECTED_AREA.title()}\n(Transaction Level)', 
              fontsize=13, fontweight='bold', pad=15)
ax1.grid(True, alpha=0.3)
ax1.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45)

# Plot 2: Monthly aggregation
ax2.bar(range(len(monthly_sales)), monthly_sales['total_units'], 
        color='coral', alpha=0.7, edgecolor='black')
ax2.set_xlabel('Month', fontsize=11, fontweight='bold')
ax2.set_ylabel('Total Units Sold', fontsize=11, fontweight='bold')
ax2.set_title(f'Monthly Sales Totals', fontsize=13, fontweight='bold', pad=15)
ax2.set_xticks(range(len(monthly_sales)))
ax2.set_xticklabels(monthly_sales['year_month_str'], rotation=45, ha='right')
ax2.grid(True, alpha=0.3, axis='y')

# Add value labels on bars
for i, v in enumerate(monthly_sales['total_units']):
    ax2.text(i, v + 1, f'{v:.0f}', ha='center', va='bottom', fontweight='bold')

# Plot 3: Distribution of units per transaction
ax3.hist(filtered_df['units_sold'], bins=15, color='lightgreen', 
         alpha=0.7, edgecolor='black')
ax3.axvline(filtered_df['units_sold'].mean(), color='red', linestyle='--', 
            linewidth=2, label=f'Mean: {filtered_df["units_sold"].mean():.1f}')
ax3.axvline(filtered_df['units_sold'].median(), color='blue', linestyle='--', 
            linewidth=2, label=f'Median: {filtered_df["units_sold"].median():.0f}')
ax3.set_xlabel('Units Sold per Transaction', fontsize=11, fontweight='bold')
ax3.set_ylabel('Frequency', fontsize=11, fontweight='bold')
ax3.set_title('Distribution of Transaction Sizes', fontsize=13, fontweight='bold', pad=15)
ax3.legend()
ax3.grid(True, alpha=0.3, axis='y')

# Plot 4: Days between sales
days_between = filtered_df['days_since_last_sale'].dropna()
if len(days_between) > 0:
    ax4.hist(days_between, bins=15, color='plum', alpha=0.7, edgecolor='black')
    ax4.axvline(days_between.mean(), color='red', linestyle='--', 
                linewidth=2, label=f'Mean: {days_between.mean():.1f} days')
    ax4.axvline(days_between.median(), color='blue', linestyle='--', 
                linewidth=2, label=f'Median: {days_between.median():.0f} days')
    ax4.set_xlabel('Days Since Last Sale', fontsize=11, fontweight='bold')
    ax4.set_ylabel('Frequency', fontsize=11, fontweight='bold')
    ax4.set_title('Sales Frequency Pattern', fontsize=13, fontweight='bold', pad=15)
    ax4.legend()
    ax4.grid(True, alpha=0.3, axis='y')

plt.tight_layout()

# Save plot
plot_file = f"sales_mapping_{SELECTED_MEDICINE.lower()}_{SELECTED_AREA.lower()}.png"
plt.savefig(plot_file, dpi=300, bbox_inches='tight')
print(f"    Saved: {plot_file}")

# Summary statistics
print(f"\n{'='*70}")
print("SUMMARY - SALES MAPPING (NO WEATHER)")
print(f"{'='*70}")
print(f"\nMedicine: {SELECTED_MEDICINE}")
print(f"Area: {SELECTED_AREA.title()}")
print(f"\nTime Period: {filtered_df['date'].min().date()} to {filtered_df['date'].max().date()}")
print(f"Total Transactions: {len(filtered_df)}")
print(f"Total Units Sold: {filtered_df['units_sold'].sum():.0f}")
print(f"Average Sale Size: {filtered_df['units_sold'].mean():.2f} units")
print(f"Sales Frequency: Every {filtered_df['days_since_last_sale'].mean():.1f} days on average")
print(f"\nOutput Files:")
print(f"  - {output_file}")
print(f"  - {plot_file}")
print(f"\n{'='*70}")
print("✅ MEDICINE SALES MAPPING COMPLETE!")
print(f"{'='*70}")
