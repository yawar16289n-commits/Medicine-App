"""
Weather Service - Fetches weather forecast from Open-Meteo API
Coordinates: Karachi, Pakistan (24.8607°N, 67.0011°E)
"""
import openmeteo_requests
import pandas as pd
import requests_cache
from retry_requests import retry
from datetime import datetime, date, timedelta
from models import WeatherData
from database import db

# Karachi coordinates
KARACHI_LATITUDE = 24.8607
KARACHI_LONGITUDE = 67.0011

# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)


def fetch_weather_forecast():
    """
    Fetch 14-day weather forecast from Open-Meteo API for Karachi
    Returns a list of dictionaries with weather data
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": KARACHI_LATITUDE,
        "longitude": KARACHI_LONGITUDE,
        "daily": [
            "apparent_temperature_max",
            "apparent_temperature_min",
            "apparent_temperature_mean",
            "relative_humidity_2m_mean",
            "relative_humidity_2m_max",
            "relative_humidity_2m_min"
        ],
        "timezone": "auto",
        "forecast_days": 14,
    }
    
    try:
        responses = openmeteo.weather_api(url, params=params)
        response = responses[0]
        
        print(f"Fetching weather for Coordinates: {response.Latitude()}°N {response.Longitude()}°E")
        print(f"Elevation: {response.Elevation()} m asl")
        print(f"Timezone: {response.Timezone()} {response.TimezoneAbbreviation()}")
        
        # Process daily data
        daily = response.Daily()
        daily_apparent_temperature_max = daily.Variables(0).ValuesAsNumpy()
        daily_apparent_temperature_min = daily.Variables(1).ValuesAsNumpy()
        daily_apparent_temperature_mean = daily.Variables(2).ValuesAsNumpy()
        daily_relative_humidity_2m_mean = daily.Variables(3).ValuesAsNumpy()
        daily_relative_humidity_2m_max = daily.Variables(4).ValuesAsNumpy()
        daily_relative_humidity_2m_min = daily.Variables(5).ValuesAsNumpy()
        
        # Create dataframe
        daily_data = {
            "date": pd.date_range(
                start=pd.to_datetime(daily.Time(), unit="s", utc=True),
                end=pd.to_datetime(daily.TimeEnd(), unit="s", utc=True),
                freq=pd.Timedelta(seconds=daily.Interval()),
                inclusive="left"
            )
        }
        
        daily_data["apparent_temperature_max"] = daily_apparent_temperature_max
        daily_data["apparent_temperature_min"] = daily_apparent_temperature_min
        daily_data["apparent_temperature_mean"] = daily_apparent_temperature_mean
        daily_data["relative_humidity_2m_mean"] = daily_relative_humidity_2m_mean
        daily_data["relative_humidity_2m_max"] = daily_relative_humidity_2m_max
        daily_data["relative_humidity_2m_min"] = daily_relative_humidity_2m_min
        
        daily_dataframe = pd.DataFrame(data=daily_data)
        
        # Convert to list of dictionaries
        weather_records = []
        for _, row in daily_dataframe.iterrows():
            weather_records.append({
                'date': row['date'].date(),
                'latitude': KARACHI_LATITUDE,
                'longitude': KARACHI_LONGITUDE,
                'apparent_temperature_max': float(row['apparent_temperature_max']),
                'apparent_temperature_min': float(row['apparent_temperature_min']),
                'apparent_temperature_mean': float(row['apparent_temperature_mean']),
                'relative_humidity_2m_mean': float(row['relative_humidity_2m_mean']),
                'relative_humidity_2m_max': float(row['relative_humidity_2m_max']),
                'relative_humidity_2m_min': float(row['relative_humidity_2m_min']),
                'is_forecast': True  # Mark as forecast data
            })
        
        return weather_records
        
    except Exception as e:
        print(f"Error fetching weather forecast: {e}")
        raise


def update_weather_database():
    """
    Fetch weather forecast and update database
    Returns number of records updated/inserted
    """
    try:
        weather_records = fetch_weather_forecast()
        
        # Mark all existing forecast records as non-forecast (convert to historical)
        today = date.today()
        WeatherData.query.filter(
            WeatherData.is_forecast == True,
            WeatherData.date < today
        ).update({'is_forecast': False})
        
        # Delete old forecast records to replace with fresh data
        WeatherData.query.filter(
            WeatherData.is_forecast == True,
            WeatherData.date >= today
        ).delete()
        
        # Insert new forecast records
        records_added = 0
        for record in weather_records:
            # Check if record already exists (for historical conversion)
            existing = WeatherData.query.filter_by(date=record['date']).first()
            
            if existing:
                # Update existing record
                for key, value in record.items():
                    if key != 'date':  # Don't update the primary key field
                        setattr(existing, key, value)
            else:
                # Create new record
                weather_data = WeatherData(**record)
                db.session.add(weather_data)
            
            records_added += 1
        
        db.session.commit()
        print(f"Successfully updated {records_added} weather forecast records")
        return records_added
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating weather database: {e}")
        raise


def get_weather_data(days=365, include_forecast=True):
    """
    Get weather data from database
    Args:
        days: Number of days of historical data to fetch
        include_forecast: Whether to include forecast data
    Returns:
        List of weather records as dictionaries
    """
    try:
        cutoff_date = date.today() - timedelta(days=days)
        
        query = WeatherData.query.filter(WeatherData.date >= cutoff_date)
        
        if not include_forecast:
            query = query.filter(WeatherData.is_forecast == False)
        
        records = query.order_by(WeatherData.date.asc()).all()
        
        return [record.to_dict() for record in records]
        
    except Exception as e:
        print(f"Error fetching weather data: {e}")
        raise
