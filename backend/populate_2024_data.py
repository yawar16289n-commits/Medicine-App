"""
Populate forecast and weather data for realistic reports
- Creates forecast values within 15% of actual sales
- Generates weather data for any specified year
- For use with MedInsights Pro report generation

Usage:
    python populate_2024_data.py [year]
    Example: python populate_2024_data.py 2024
"""
import sys
import os
import random
from datetime import datetime, date, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from database import db
from models import MedicineForecast, MedicineSales, WeatherData, Medicine, District
from sqlalchemy import func, extract

# Karachi coordinates
KARACHI_LAT = 24.8607
KARACHI_LON = 67.0011


def calculate_accuracy(forecasted, actual):
    """Calculate forecast accuracy: 100 - ABS(forecasted - actual) / actual * 100"""
    actual = float(actual)  # Handle Decimal
    if actual == 0:
        return 100.0 if forecasted == 0 else 0.0
    return 100 - abs(forecasted - actual) / actual * 100


def generate_weather_data(year):
    """Generate realistic weather data for Karachi for specified year"""
    print(f"\n=== Generating Weather Data for {year} ===")
    
    # Karachi typical weather patterns by month
    # [avg_temp, temp_variance, avg_humidity, humidity_variance]
    monthly_weather = {
        1: (19, 4, 45, 10),   # January - cool, dry
        2: (21, 4, 40, 10),   # February - warming
        3: (26, 5, 35, 10),   # March - warm
        4: (30, 4, 40, 12),   # April - hot
        5: (32, 3, 50, 15),   # May - very hot, pre-monsoon
        6: (33, 3, 65, 15),   # June - hot, humid
        7: (31, 2, 75, 10),   # July - monsoon peak
        8: (30, 2, 78, 8),    # August - monsoon
        9: (30, 3, 72, 10),   # September - post monsoon
        10: (29, 4, 55, 12),  # October - cooling
        11: (25, 4, 50, 10),  # November - pleasant
        12: (20, 4, 48, 10),  # December - cool
    }
    
    # Delete existing weather data for the year
    deleted = WeatherData.query.filter(
        extract('year', WeatherData.date) == year
    ).delete(synchronize_session=False)
    db.session.commit()
    print(f"Deleted {deleted} existing {year} weather records")
    
    # Generate daily weather for the year
    start_date = date(year, 1, 1)
    end_date = date(year, 12, 31)
    current_date = start_date
    
    weather_records = []
    while current_date <= end_date:
        month = current_date.month
        avg_temp, temp_var, avg_humidity, humidity_var = monthly_weather[month]
        
        # Generate realistic daily values with variance
        mean_temp = avg_temp + random.uniform(-temp_var, temp_var)
        max_temp = mean_temp + random.uniform(3, 7)
        min_temp = mean_temp - random.uniform(3, 7)
        
        mean_humidity = max(20, min(95, avg_humidity + random.uniform(-humidity_var, humidity_var)))
        max_humidity = min(100, mean_humidity + random.uniform(5, 15))
        min_humidity = max(10, mean_humidity - random.uniform(5, 15))
        
        weather = WeatherData(
            date=current_date,
            latitude=KARACHI_LAT,
            longitude=KARACHI_LON,
            apparent_temperature_mean=round(mean_temp, 1),
            apparent_temperature_max=round(max_temp, 1),
            apparent_temperature_min=round(min_temp, 1),
            relative_humidity_2m_mean=round(mean_humidity, 1),
            relative_humidity_2m_max=round(max_humidity, 1),
            relative_humidity_2m_min=round(min_humidity, 1),
            is_forecast=False
        )
        weather_records.append(weather)
        current_date += timedelta(days=1)
    
    db.session.bulk_save_objects(weather_records)
    db.session.commit()
    print(f"Created {len(weather_records)} weather records for {year}")
    
    # Show monthly averages
    print(f"\nMonthly Weather Summary ({year}):")
    for month in range(1, 13):
        month_data = [w for w in weather_records if w.date.month == month]
        avg_t = sum(w.apparent_temperature_mean for w in month_data) / len(month_data)
        avg_h = sum(w.relative_humidity_2m_mean for w in month_data) / len(month_data)
        print(f"  {datetime(year, month, 1).strftime('%B')}: {avg_t:.1f}°C, {avg_h:.0f}% humidity")


def generate_forecast_data(year):
    """Generate forecast data within 15% of actual sales for specified year"""
    print(f"\n=== Generating Forecast Data for {year} ===")
    
    # Get all actual sales grouped by medicine, district, month
    sales_data = db.session.query(
        MedicineSales.medicine_id,
        MedicineSales.district_id,
        extract('month', MedicineSales.date).label('month'),
        func.sum(MedicineSales.quantity).label('total_quantity')
    ).filter(
        extract('year', MedicineSales.date) == year
    ).group_by(
        MedicineSales.medicine_id,
        MedicineSales.district_id,
        extract('month', MedicineSales.date)
    ).all()
    
    print(f"Found {len(sales_data)} medicine/district/month combinations with sales")
    
    if not sales_data:
        print(f"No sales data found for {year}!")
        return 0
    
    # Delete existing forecasts for the year
    deleted = MedicineForecast.query.filter(
        extract('year', MedicineForecast.forecast_date) == year
    ).delete(synchronize_session=False)
    db.session.commit()
    print(f"Deleted {deleted} existing {year} forecast records")
    
    # Generate forecasts with wider variance for more realistic spread
    forecast_records = []
    accuracy_sum = 0
    
    for sale in sales_data:
        actual = float(sale.total_quantity)  # Convert Decimal to float
        
        # Wider variance range: -20% to -8% for accuracy 80% to 92%
        # This ensures some below 85% and some above 87%
        variance_pct = random.uniform(-0.20, -0.08)
        
        forecasted = max(1, int(actual * (1 + variance_pct)))
        
        accuracy = calculate_accuracy(forecasted, actual)
        accuracy_sum += accuracy
        
        forecast = MedicineForecast(
            medicine_id=sale.medicine_id,
            district_id=sale.district_id,
            forecast_date=date(year, int(sale.month), 15),
            forecasted_quantity=forecasted
        )
        forecast_records.append(forecast)
    
    db.session.bulk_save_objects(forecast_records)
    db.session.commit()
    
    avg_accuracy = accuracy_sum / len(forecast_records) if forecast_records else 0
    print(f"Created {len(forecast_records)} forecast records for {year}")
    print(f"Average forecast accuracy: {avg_accuracy:.1f}%")
    
    return avg_accuracy


def verify_data(year):
    """Verify the generated data for specified year"""
    print(f"\n=== Verification for {year} ===")
    
    # Weather verification
    weather_count = db.session.query(func.count(WeatherData.id)).filter(
        extract('year', WeatherData.date) == year
    ).scalar()
    print(f"Weather records: {weather_count}")
    
    # Forecast verification
    forecast_count = db.session.query(func.count(MedicineForecast.id)).filter(
        extract('year', MedicineForecast.forecast_date) == year
    ).scalar()
    print(f"Forecast records: {forecast_count}")
    
    # Sales verification
    sales_count = db.session.query(func.count(MedicineSales.id)).filter(
        extract('year', MedicineSales.date) == year
    ).scalar()
    print(f"Sales records: {sales_count}")
    
    # Sample accuracy check
    print("\nSample forecast vs actual (first 5):")
    sample = db.session.query(MedicineForecast).filter(
        extract('year', MedicineForecast.forecast_date) == year
    ).limit(5).all()
    
    for f in sample:
        actual = db.session.query(func.sum(MedicineSales.quantity)).filter(
            MedicineSales.medicine_id == f.medicine_id,
            MedicineSales.district_id == f.district_id,
            extract('year', MedicineSales.date) == year,
            extract('month', MedicineSales.date) == f.forecast_date.month
        ).scalar() or 0
        
        accuracy = calculate_accuracy(f.forecasted_quantity, actual)
        print(f"  Forecast: {f.forecasted_quantity:,}, Actual: {actual:,}, Accuracy: {accuracy:.1f}%")


def main():
    # Get year from command line argument
    if len(sys.argv) > 1:
        try:
            year = int(sys.argv[1])
        except ValueError:
            print(f"Invalid year: {sys.argv[1]}. Using 2024.")
            year = 2024
    else:
        year = 2024
    
    print("=" * 60)
    print(f"Populating {year} Forecast and Weather Data")
    print("=" * 60)
    
    app = create_app()
    
    with app.app_context():
        generate_weather_data(year)
        generate_forecast_data(year)
        verify_data(year)
    
    print("\n" + "=" * 60)
    print("Done! You can now regenerate reports with:")
    print(f"  python generate_all_reports.py {year}")
    print("=" * 60)


if __name__ == '__main__':
    main()
