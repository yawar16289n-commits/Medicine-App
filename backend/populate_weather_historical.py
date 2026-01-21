"""
Populate weather table with historical data from Open-Meteo Archive API
This script truncates the weather_data table and populates it with real historical weather data
for Karachi from 2019-01-01 to 2026-01-20
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import openmeteo_requests
import pandas as pd
import requests_cache
from retry_requests import retry
from datetime import datetime

from app import create_app
from database import db
from models import WeatherData

def fetch_and_populate_weather():
    """Fetch historical weather data and populate the database"""
    
    # Setup the Open-Meteo API client with cache and retry on error
    cache_session = requests_cache.CachedSession('.cache', expire_after=-1)
    retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
    openmeteo = openmeteo_requests.Client(session=retry_session)

    # Karachi coordinates
    latitude = 24.8607
    longitude = 67.0011

    # API parameters
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": "2019-01-01",
        "end_date": "2026-01-20",
        "daily": [
            "apparent_temperature_mean",
            "apparent_temperature_max", 
            "apparent_temperature_min",
            "relative_humidity_2m_max",
            "relative_humidity_2m_min",
            "relative_humidity_2m_mean"
        ],
    }

    print("Fetching weather data from Open-Meteo Archive API...")
    print(f"Location: Karachi ({latitude}°N, {longitude}°E)")
    print(f"Date range: {params['start_date']} to {params['end_date']}")
    
    responses = openmeteo.weather_api(url, params=params)

    # Process first location
    response = responses[0]
    print(f"\nAPI Response:")
    print(f"  Coordinates: {response.Latitude()}°N {response.Longitude()}°E")
    print(f"  Elevation: {response.Elevation()} m asl")
    print(f"  Timezone difference to GMT+0: {response.UtcOffsetSeconds()}s")

    # Process daily data
    daily = response.Daily()
    daily_apparent_temperature_mean = daily.Variables(0).ValuesAsNumpy()
    daily_apparent_temperature_max = daily.Variables(1).ValuesAsNumpy()
    daily_apparent_temperature_min = daily.Variables(2).ValuesAsNumpy()
    daily_relative_humidity_2m_max = daily.Variables(3).ValuesAsNumpy()
    daily_relative_humidity_2m_min = daily.Variables(4).ValuesAsNumpy()
    daily_relative_humidity_2m_mean = daily.Variables(5).ValuesAsNumpy()

    daily_data = {
        "date": pd.date_range(
            start=pd.to_datetime(daily.Time(), unit="s", utc=True),
            end=pd.to_datetime(daily.TimeEnd(), unit="s", utc=True),
            freq=pd.Timedelta(seconds=daily.Interval()),
            inclusive="left"
        )
    }

    daily_data["apparent_temperature_mean"] = daily_apparent_temperature_mean
    daily_data["apparent_temperature_max"] = daily_apparent_temperature_max
    daily_data["apparent_temperature_min"] = daily_apparent_temperature_min
    daily_data["relative_humidity_2m_max"] = daily_relative_humidity_2m_max
    daily_data["relative_humidity_2m_min"] = daily_relative_humidity_2m_min
    daily_data["relative_humidity_2m_mean"] = daily_relative_humidity_2m_mean

    daily_dataframe = pd.DataFrame(data=daily_data)
    print(f"\nFetched {len(daily_dataframe)} days of weather data")
    print(daily_dataframe.head())

    # Truncate weather_data table
    print("\n=== Truncating weather_data table ===")
    deleted_count = WeatherData.query.delete()
    db.session.commit()
    print(f"Deleted {deleted_count} existing records")

    # Insert new records
    print("\n=== Inserting historical weather data ===")
    weather_records = []
    
    for _, row in daily_dataframe.iterrows():
        # Convert pandas Timestamp to Python date
        record_date = row['date'].date() if hasattr(row['date'], 'date') else row['date']
        
        weather = WeatherData(
            date=record_date,
            latitude=latitude,
            longitude=longitude,
            apparent_temperature_max=float(row['apparent_temperature_max']) if pd.notna(row['apparent_temperature_max']) else None,
            apparent_temperature_min=float(row['apparent_temperature_min']) if pd.notna(row['apparent_temperature_min']) else None,
            apparent_temperature_mean=float(row['apparent_temperature_mean']) if pd.notna(row['apparent_temperature_mean']) else None,
            relative_humidity_2m_max=float(row['relative_humidity_2m_max']) if pd.notna(row['relative_humidity_2m_max']) else None,
            relative_humidity_2m_min=float(row['relative_humidity_2m_min']) if pd.notna(row['relative_humidity_2m_min']) else None,
            relative_humidity_2m_mean=float(row['relative_humidity_2m_mean']) if pd.notna(row['relative_humidity_2m_mean']) else None,
            is_forecast=False  # Historical data
        )
        weather_records.append(weather)

    # Bulk insert
    db.session.bulk_save_objects(weather_records)
    db.session.commit()
    
    print(f"Successfully inserted {len(weather_records)} weather records")
    
    # Verify
    total_records = WeatherData.query.count()
    print(f"\nTotal records in weather_data table: {total_records}")
    
    # Show date range
    first_record = WeatherData.query.order_by(WeatherData.date.asc()).first()
    last_record = WeatherData.query.order_by(WeatherData.date.desc()).first()
    if first_record and last_record:
        print(f"Date range: {first_record.date} to {last_record.date}")

    return len(weather_records)


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        fetch_and_populate_weather()
        print("\n=== Weather data population complete! ===")
