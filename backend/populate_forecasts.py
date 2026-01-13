"""
Populate Medicine Forecasts from External Prophet API

This script:
1. Reads all district-medicine-formula combinations from district_medicine_lookup table
2. Fetches forecasts from external Prophet API for each unique district-formula pair
3. Saves the forecast data to medicine_forecast table

Usage:
    python populate_forecasts.py [--api-url URL] [--days DAYS] [--dry-run]
    
Options:
    --api-url    External Prophet API URL (default: http://127.0.0.1:5000)
    --days       Number of days to forecast (default: 30)
    --dry-run    Show what would be done without actually saving to database
    --verbose    Show detailed progress information
"""

import sys
import os
import argparse
from datetime import datetime, timedelta
from pathlib import Path
import io

# Fix encoding issues on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Add parent directory to path to import from backend
sys.path.insert(0, str(Path(__file__).parent))

# Now we can import from our backend modules
from database import db
from models import DistrictMedicineLookup, District, Formula, Medicine, MedicineForecast
from app import create_app
import requests
import json
from sqlalchemy import func


def fetch_forecast_from_api(api_url, area, medicine, days, timeout=30):
    """
    Fetch forecast from external Prophet API
    
    Args:
        api_url: Base URL of Prophet API
        area: District/area name
        medicine: Medicine brand name
        days: Number of days to forecast
        timeout: Request timeout in seconds
        
    Returns:
        dict: Forecast data with 'dates' and 'values' keys, or None if failed
    """
    try:
        external_url = f"{api_url}/forecast"
        params = {'area': area, 'medicine': medicine, 'days': days}
        
        print(f"  Calling API: {external_url}")
        print(f"  Params: {params}")
        
        response = requests.get(external_url, params=params, timeout=timeout)
        response.raise_for_status()
        
        # Handle NaN values in JSON
        response_text = response.text.replace('NaN', 'null')
        forecast_data = json.loads(response_text)
        
        if 'forecast' not in forecast_data:
            print(f"  ⚠️  Warning: No 'forecast' key in response")
            return None
            
        forecast = forecast_data['forecast']
        
        if 'dates' not in forecast or 'values' not in forecast:
            print(f"  ⚠️  Warning: Missing 'dates' or 'values' in forecast")
            return None
        
        # Filter out null/None values (previously NaN)
        dates = forecast['dates']
        values = forecast['values']
        valid_forecasts = [(d, v) for d, v in zip(dates, values) if v is not None]
        
        if not valid_forecasts:
            print(f"  ⚠️  Warning: All forecast values are null/NaN")
            return None
        
        forecast_dates, forecast_values = zip(*valid_forecasts)
        
        return {
            'dates': list(forecast_dates),
            'values': list(forecast_values),
            'count': len(forecast_dates)
        }
        
    except requests.exceptions.ConnectionError:
        print(f"  ❌ Error: Cannot connect to API at {api_url}")
        return None
    except requests.exceptions.HTTPError as e:
        print(f"  ❌ Error: API returned {e.response.status_code}")
        return None
    except json.JSONDecodeError as e:
        print(f"  ❌ Error: Invalid JSON response - {str(e)}")
        return None
    except Exception as e:
        print(f"  ❌ Error: {type(e).__name__}: {str(e)}")
        return None


def save_forecasts_to_db(district_id, medicine_ids, forecast_data, dry_run=False):
    """
    Save forecast data to medicine_forecast table
    
    Args:
        district_id: ID of the district
        medicine_ids: List of medicine IDs (single medicine for this combination)
        forecast_data: Dictionary with 'dates' and 'values'
        dry_run: If True, don't actually save to database
        
    Returns:
        int: Number of forecasts saved
    """
    if dry_run:
        total = len(forecast_data['dates']) * len(medicine_ids)
        print(f"  [DRY RUN] Would save {total} forecast records")
        return total
    
    saved_count = 0
    values = forecast_data['values']
    
    # IMPORTANT: Use TODAY's date as the start, not the API's dates
    # The external API returns dates based on its training data end date (e.g., 2024)
    # But we want forecasts starting from today
    today = datetime.now().date()
    
    for i, total_value in enumerate(values):
        forecast_date = today + timedelta(days=i)
        quantity = max(0, int(round(total_value)))
        
        for medicine_id in medicine_ids:
            # Check if forecast already exists
            existing = MedicineForecast.query.filter_by(
                medicine_id=medicine_id,
                district_id=district_id,
                forecast_date=forecast_date
            ).first()
            
            if existing:
                # Update existing forecast
                existing.forecasted_quantity = quantity
                existing.model_version = 'prophet_external_v1'
                existing.created_at = datetime.now()
            else:
                # Create new forecast
                new_forecast = MedicineForecast(
                    medicine_id=medicine_id,
                    district_id=district_id,
                    forecast_date=forecast_date,
                    forecasted_quantity=quantity,
                    model_version='prophet_external_v1'
                )
                db.session.add(new_forecast)
            
            saved_count += 1
    
    return saved_count


def populate_all_forecasts(api_url='http://127.0.0.1:5000', days=30, dry_run=False, verbose=False):
    """
    Main function to populate forecasts for all district-medicine combinations
    
    Args:
        api_url: External Prophet API URL
        days: Number of days to forecast
        dry_run: If True, don't save to database
        verbose: If True, show detailed progress
    """
    print("=" * 70)
    print("POPULATE MEDICINE FORECASTS FROM PROPHET API")
    print("=" * 70)
    print(f"API URL: {api_url}")
    print(f"Forecast days: {days}")
    print(f"Mode: {'DRY RUN (no changes)' if dry_run else 'LIVE (will save to database)'}")
    print("=" * 70)
    print()
    
    # Step 1: Get all unique district-medicine combinations from lookup table
    print("Step 1: Fetching district-medicine combinations from lookup table...")
    
    combinations = db.session.query(
        DistrictMedicineLookup.district_id,
        DistrictMedicineLookup.medicine_id
    ).distinct().all()
    
    print(f"Found {len(combinations)} unique district-medicine combinations")
    print()
    
    if not combinations:
        print("⚠️  No combinations found in district_medicine_lookup table")
        print("   Make sure you have sales data and the lookup table is populated")
        return
    
    # Step 2: Process each combination
    total_success = 0
    total_failed = 0
    total_forecasts_saved = 0
    
    for idx, (district_id, medicine_id) in enumerate(combinations, 1):
        # Get district and medicine info
        district = District.query.get(district_id)
        medicine = Medicine.query.get(medicine_id)
        
        if not district or not medicine or not medicine.formula:
            print(f"⚠️  Skipping invalid combination: district_id={district_id}, medicine_id={medicine_id}")
            total_failed += 1
            continue
        
        formula = medicine.formula
        
        print(f"[{idx}/{len(combinations)}] Processing: {district.name} - {medicine.brand_name} ({formula.name})")
        
        # Process this specific medicine
        medicine_ids = [medicine_id]
        
        if verbose:
            print(f"  Medicine ID: {medicine_id}")
            print(f"  Medicine Brand: {medicine.brand_name}")
            print(f"  Formula: {formula.name}")
        
        # Fetch forecast from API for this specific medicine
        forecast_data = fetch_forecast_from_api(
            api_url=api_url,
            area=district.name,
            medicine=medicine.brand_name,
            days=days
        )
        
        if forecast_data is None:
            print(f"  ❌ Failed to fetch forecast")
            total_failed += 1
            continue
        
        print(f"  ✅ Received {forecast_data['count']} forecast data points")
        
        # Save to database
        try:
            saved = save_forecasts_to_db(
                district_id=district_id,
                medicine_ids=medicine_ids,
                forecast_data=forecast_data,
                dry_run=dry_run
            )
            
            if not dry_run:
                db.session.commit()
            
            print(f"  ✅ Saved {saved} forecast records")
            total_forecasts_saved += saved
            total_success += 1
            
        except Exception as e:
            print(f"  ❌ Error saving to database: {str(e)}")
            if not dry_run:
                db.session.rollback()
            total_failed += 1
        
        print()
    
    # Step 3: Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total combinations processed: {len(combinations)}")
    print(f"Successful: {total_success}")
    print(f"Failed: {total_failed}")
    print(f"Total forecast records saved: {total_forecasts_saved}")
    
    if dry_run:
        print()
        print("🔵 DRY RUN MODE - No changes were made to the database")
        print("   Run without --dry-run to actually save the forecasts")


def main():
    """Command-line interface"""
    parser = argparse.ArgumentParser(
        description='Populate medicine forecasts from external Prophet API',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Dry run (no changes to database)
  python populate_forecasts.py --dry-run
  
  # Populate forecasts for 30 days (default)
  python populate_forecasts.py
  
  # Populate forecasts for 60 days with custom API URL
  python populate_forecasts.py --days 60 --api-url http://localhost:8000
  
  # Verbose output
  python populate_forecasts.py --verbose
        """
    )
    
    parser.add_argument(
        '--api-url',
        default='http://127.0.0.1:5000',
        help='External Prophet API URL (default: http://127.0.0.1:5000)'
    )
    
    parser.add_argument(
        '--days',
        type=int,
        default=30,
        help='Number of days to forecast (default: 30)'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without saving to database'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed progress information'
    )
    
    args = parser.parse_args()
    
    # Validate days
    if args.days < 1 or args.days > 365:
        print("Error: days must be between 1 and 365")
        sys.exit(1)
    
    # Create Flask app context
    app = create_app()
    
    with app.app_context():
        try:
            populate_all_forecasts(
                api_url=args.api_url,
                days=args.days,
                dry_run=args.dry_run,
                verbose=args.verbose
            )
        except KeyboardInterrupt:
            print("\n\n⚠️  Interrupted by user")
            sys.exit(1)
        except Exception as e:
            print(f"\n\n❌ Fatal error: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            sys.exit(1)


if __name__ == '__main__':
    main()
