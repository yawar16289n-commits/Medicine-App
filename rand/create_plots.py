"""
Create visualizations for weather impact analysis
"""

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

# Configuration
MEDICINE = "Diflucan"
AREA = "pechs"

print("Creating visualizations...")

# Load the data
df = pd.read_csv('medicine_weather_single.csv')
df['date'] = pd.to_datetime(df['date'])

print(f"Loaded {len(df)} days of data")
print(f"Days with sales: {(df['units_sold'] > 0).sum()}")

# Create figure with 3 subplots
fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(16, 12))

# Plot 1: Units Sold vs Temperature
ax1_twin = ax1.twinx()
ax1.bar(df['date'], df['units_sold'], alpha=0.6, color='steelblue', label='Units Sold', width=1)
ax1_twin.plot(df['date'], df['temperature_2m_mean'], color='orangered', linewidth=2, label='Temperature', marker='o', markersize=2)

ax1.set_ylabel('Units Sold', fontsize=12, fontweight='bold', color='steelblue')
ax1_twin.set_ylabel('Temperature (°C)', fontsize=12, fontweight='bold', color='orangered')
ax1.set_title(f'{MEDICINE} Sales in {AREA.title()} vs Temperature\n(All dates with zero-filled sales)', 
              fontsize=14, fontweight='bold', pad=15)
ax1.legend(loc='upper left')
ax1_twin.legend(loc='upper right')
ax1.grid(True, alpha=0.3)
ax1.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
ax1.xaxis.set_major_locator(mdates.MonthLocator(interval=2))
plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45)

# Plot 2: Units Sold vs Humidity
ax2_twin = ax2.twinx()
ax2.bar(df['date'], df['units_sold'], alpha=0.6, color='steelblue', label='Units Sold', width=1)
ax2_twin.plot(df['date'], df['relative_humidity_2m_mean'], color='green', linewidth=2, label='Humidity', marker='o', markersize=2)

ax2.set_ylabel('Units Sold', fontsize=12, fontweight='bold', color='steelblue')
ax2_twin.set_ylabel('Relative Humidity (%)', fontsize=12, fontweight='bold', color='green')
ax2.set_title(f'{MEDICINE} Sales in {AREA.title()} vs Humidity', 
              fontsize=14, fontweight='bold', pad=15)
ax2.legend(loc='upper left')
ax2_twin.legend(loc='upper right')
ax2.grid(True, alpha=0.3)
ax2.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
ax2.xaxis.set_major_locator(mdates.MonthLocator(interval=2))
plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45)

# Plot 3: Units Sold vs Precipitation
ax3_twin = ax3.twinx()
ax3.bar(df['date'], df['units_sold'], alpha=0.6, color='steelblue', label='Units Sold', width=1)
ax3_twin.plot(df['date'], df['precipitation_sum'], color='purple', linewidth=2, label='Precipitation', marker='o', markersize=2)

ax3.set_xlabel('Date', fontsize=12, fontweight='bold')
ax3.set_ylabel('Units Sold', fontsize=12, fontweight='bold', color='steelblue')
ax3_twin.set_ylabel('Precipitation (mm)', fontsize=12, fontweight='bold', color='purple')
ax3.set_title(f'{MEDICINE} Sales in {AREA.title()} vs Precipitation', 
              fontsize=14, fontweight='bold', pad=15)
ax3.legend(loc='upper left')
ax3_twin.legend(loc='upper right')
ax3.grid(True, alpha=0.3)
ax3.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
ax3.xaxis.set_major_locator(mdates.MonthLocator(interval=2))
plt.setp(ax3.xaxis.get_majorticklabels(), rotation=45)

plt.tight_layout()

# Save
filename = f"weather_impact_{MEDICINE.lower()}_{AREA.lower()}_complete.png"
plt.savefig(filename, dpi=300, bbox_inches='tight')
print(f"\n✓ Saved: {filename}")

# Create a second plot: Scatter plots for correlations
fig2, (ax4, ax5, ax6) = plt.subplots(1, 3, figsize=(18, 5))

# Only plot days with sales for scatter
sales_days = df[df['units_sold'] > 0]

# Scatter 1: Units vs Temperature
ax4.scatter(sales_days['temperature_2m_mean'], sales_days['units_sold'], 
            alpha=0.7, s=100, color='orangered', edgecolors='black')
ax4.set_xlabel('Temperature (°C)', fontsize=11, fontweight='bold')
ax4.set_ylabel('Units Sold', fontsize=11, fontweight='bold')
ax4.set_title('Units Sold vs Temperature\n(Sale Days Only)', fontsize=12, fontweight='bold')
ax4.grid(True, alpha=0.3)

# Add correlation text
temp_corr = sales_days[['units_sold', 'temperature_2m_mean']].corr().iloc[0, 1]
ax4.text(0.05, 0.95, f'r = {temp_corr:.3f}', transform=ax4.transAxes, 
         fontsize=12, verticalalignment='top', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

# Scatter 2: Units vs Humidity
ax5.scatter(sales_days['relative_humidity_2m_mean'], sales_days['units_sold'], 
            alpha=0.7, s=100, color='green', edgecolors='black')
ax5.set_xlabel('Relative Humidity (%)', fontsize=11, fontweight='bold')
ax5.set_ylabel('Units Sold', fontsize=11, fontweight='bold')
ax5.set_title('Units Sold vs Humidity\n(Sale Days Only)', fontsize=12, fontweight='bold')
ax5.grid(True, alpha=0.3)

# Add correlation text
humid_corr = sales_days[['units_sold', 'relative_humidity_2m_mean']].corr().iloc[0, 1]
ax5.text(0.05, 0.95, f'r = {humid_corr:.3f}', transform=ax5.transAxes, 
         fontsize=12, verticalalignment='top', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

# Scatter 3: Units vs Precipitation
ax6.scatter(sales_days['precipitation_sum'], sales_days['units_sold'], 
            alpha=0.7, s=100, color='purple', edgecolors='black')
ax6.set_xlabel('Precipitation (mm)', fontsize=11, fontweight='bold')
ax6.set_ylabel('Units Sold', fontsize=11, fontweight='bold')
ax6.set_title('Units Sold vs Precipitation\n(Sale Days Only)', fontsize=12, fontweight='bold')
ax6.grid(True, alpha=0.3)

# Add correlation text
precip_corr = sales_days[['units_sold', 'precipitation_sum']].corr().iloc[0, 1]
ax6.text(0.05, 0.95, f'r = {precip_corr:.3f}', transform=ax6.transAxes, 
         fontsize=12, verticalalignment='top', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

plt.tight_layout()

# Save scatter plots
filename2 = f"correlation_scatter_{MEDICINE.lower()}_{AREA.lower()}.png"
plt.savefig(filename2, dpi=300, bbox_inches='tight')
print(f"✓ Saved: {filename2}")

print("\n✅ All visualizations created successfully!")
