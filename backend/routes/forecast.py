"""Forecasting routes - medicine sales predictions"""
from flask import Blueprint, request, jsonify
from pathlib import Path
from datetime import datetime, timedelta
from models import MedicineSales, MedicineForecast, Medicine, District, Formula, DistrictMedicineLookup
from database import db
from sqlalchemy import func
import requests

forecast_bp = Blueprint('forecast', __name__)

@forecast_bp.route('/forecast/metadata/areas', methods=['GET'])
def get_forecast_areas():
    """
    Get list of areas (districts) from district_medicine_lookup table.
    Returns list of district names that have medicines assigned.
    """
    try:
        # Get districts that have entries in district_medicine_lookup
        districts_with_medicines = db.session.query(District).join(
            DistrictMedicineLookup, District.id == DistrictMedicineLookup.district_id
        ).distinct().all()
        
        area_list = [district.name for district in districts_with_medicines]
        
        return jsonify({
            'areas': sorted(area_list),
            'count': len(area_list)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve areas: {str(e)}'}), 500


@forecast_bp.route('/forecast/metadata/formulas', methods=['GET'])
def get_forecast_formulas():
    """
    Get list of formulas from district_medicine_lookup table, optionally filtered by area.
    Query params:
        - area: (optional) Filter formulas by area/district
    """
    try:
        area_name = request.args.get('area')
        
        # Query formulas directly from district_medicine_lookup
        query = db.session.query(Formula).join(
            DistrictMedicineLookup, Formula.id == DistrictMedicineLookup.formula_id
        )
        
        # Filter by area if provided
        if area_name:
            query = query.join(
                District, DistrictMedicineLookup.district_id == District.id
            ).filter(func.lower(District.name) == func.lower(area_name))
        
        formulas = query.distinct().all()
        formula_list = [formula.name for formula in formulas]
        
        response = {
            'formulas': sorted(formula_list),
            'count': len(formula_list)
        }
        
        if area_name:
            response['area'] = area_name
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve formulas: {str(e)}'}), 500


@forecast_bp.route('/forecast', methods=['GET'])
def get_area_formula_forecast():
    """
    Get forecast for a specific area (district) and formula combination.
    Query params:
        - area: District name (e.g., 'Bahadurabad')
        - formula: Formula name (e.g., 'Acetylsalicylic_Acid')
        - days: Number of days to forecast (default: 30)
    """
    try:
        # Get query parameters
        area_name = request.args.get('area')
        formula_name = request.args.get('formula')
        days = request.args.get('days', 30, type=int)
        
        # Validate required parameters
        if not area_name:
            return jsonify({'error': 'area parameter is required'}), 400
        if not formula_name:
            return jsonify({'error': 'formula parameter is required'}), 400
        
        # Validate days range
        if days < 1 or days > 365:
            return jsonify({'error': 'days must be between 1 and 365'}), 400
        
        # Normalize formula name (replace underscores with spaces for DB lookup)
        formula_search = formula_name.replace('_', ' ')
        
        # Find district by name (case-insensitive)
        district = District.query.filter(func.lower(District.name) == func.lower(area_name)).first()
        if not district:
            return jsonify({
                'error': f'District not found: {area_name}',
                'hint': 'Check available districts via GET /api/districts'
            }), 404
        
        # Find formula by name (case-insensitive, try both with spaces and underscores)
        formula = Formula.query.filter(
            func.lower(Formula.name).in_([
                func.lower(formula_search),
                func.lower(formula_name)
            ])
        ).first()
        
        if not formula:
            return jsonify({
                'error': f'Formula not found: {formula_name}',
                'hint': 'Check available formulas via GET /api/formulas'
            }), 404
        
        # Get medicines with this formula that are available in this district
        # Use district_medicine_lookup to find the right medicines
        medicines = db.session.query(Medicine).join(
            DistrictMedicineLookup, Medicine.id == DistrictMedicineLookup.medicine_id
        ).filter(
            DistrictMedicineLookup.district_id == district.id,
            DistrictMedicineLookup.formula_id == formula.id
        ).all()
        
        if not medicines:
            return jsonify({
                'error': f'No medicines found for formula "{formula.name}" in district "{district.name}"',
                'hint': 'This formula may not be available in this district. Check district_medicine_lookup table.'
            }), 404
        
        # Collect historical sales data for these medicines in this district
        # NOTE: lookup_medicine_ids is for forecast prediction (what SHOULD exist)
        lookup_medicine_ids = [m.id for m in medicines]
        
        # For HISTORICAL sales chart, we want ALL medicines with this formula
        # (not just what's in lookup), because formula historical = sum of all medicine sales for that formula
        all_formula_medicine_ids = [
            mid for (mid,) in db.session.query(Medicine.id)
            .filter(Medicine.formula_id == formula.id)
            .all()
        ]
        
        # Get historical sales (last 365 days for context, fall back to all-time)
        historical_start = datetime.now().date() - timedelta(days=365)
        historical_sales = db.session.query(
            MedicineSales.date,
            func.sum(MedicineSales.quantity).label('total_quantity')
        ).filter(
            MedicineSales.medicine_id.in_(all_formula_medicine_ids),
            MedicineSales.district_id == district.id,
            MedicineSales.date >= historical_start
        ).group_by(MedicineSales.date).order_by(MedicineSales.date).all()

        # If there's older data (outside last 365 days), fall back to all-time
        if not historical_sales:
            historical_sales = db.session.query(
                MedicineSales.date,
                func.sum(MedicineSales.quantity).label('total_quantity')
            ).filter(
                MedicineSales.medicine_id.in_(all_formula_medicine_ids),
                MedicineSales.district_id == district.id
            ).group_by(MedicineSales.date).order_by(MedicineSales.date).all()
        
        # For forecast predictions, use medicines from lookup (what should be ordered for this district)
        medicine_ids = lookup_medicine_ids
        
        # Define forecast date range based on requested days
        forecast_start = datetime.now().date()
        forecast_end = forecast_start + timedelta(days=days)
        
        # First, try to get forecasts from MedicineForecast table
        existing_forecasts = db.session.query(
            MedicineForecast.forecast_date,
            func.sum(MedicineForecast.forecasted_quantity).label('total_quantity')
        ).filter(
            MedicineForecast.medicine_id.in_(medicine_ids),
            MedicineForecast.district_id == district.id,
            MedicineForecast.forecast_date >= forecast_start,
            MedicineForecast.forecast_date < forecast_end
        ).group_by(MedicineForecast.forecast_date).order_by(MedicineForecast.forecast_date).all()
        
        forecast_data = []
        
        if existing_forecasts:
            # Use existing forecasts from database
            for forecast_row in existing_forecasts:
                forecast_data.append({
                    'date': forecast_row.forecast_date.isoformat(),
                    'predicted_quantity': int(forecast_row.total_quantity),
                    'source': 'database'
                })
        else:
            # No forecasts in database - try external Prophet API first
            
            external_api_url = 'http://127.0.0.1:5000'
            try:
                import json
                external_url = f"{external_api_url}/forecast"
                params = {'area': area_name, 'formula': formula_name, 'days': days}
                
                response = requests.get(external_url, params=params, timeout=10)
                
                if response.status_code == 200:
                    # Handle NaN values
                    response_text = response.text.replace('NaN', 'null')
                    forecast_response = json.loads(response_text)
                    
                    if 'forecast' in forecast_response:
                        forecast_dates = forecast_response['forecast'].get('dates', [])
                        forecast_values = forecast_response['forecast'].get('values', [])
                        
                        # Filter valid values and limit to requested days
                        valid_forecasts = [(d, v) for d, v in zip(forecast_dates, forecast_values) if v is not None][:days]
                        
                        if valid_forecasts:
                            # Build forecast_data from API response
                            for date_str, value in valid_forecasts:
                                predicted_qty = max(0, int(round(value)))
                                forecast_data.append({
                                    'date': date_str,
                                    'predicted_quantity': predicted_qty,
                                    'source': 'prophet_api'
                                })
                            
                            # Save to database
                            per_medicine_qty = int(predicted_qty / len(medicine_ids)) if medicine_ids and predicted_qty > 0 else predicted_qty
                            for date_str, value in valid_forecasts:
                                forecast_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                                for med_id in medicine_ids:
                                    existing = MedicineForecast.query.filter_by(
                                        medicine_id=med_id,
                                        district_id=district.id,
                                        forecast_date=forecast_date
                                    ).first()
                                    
                                    if not existing:
                                        new_forecast = MedicineForecast(
                                            medicine_id=med_id,
                                            district_id=district.id,
                                            forecast_date=forecast_date,
                                            forecasted_quantity=per_medicine_qty,
                                            model_version='prophet_external_v1'
                                        )
                                        db.session.add(new_forecast)
                            
                            try:
                                db.session.commit()
                            except Exception as e:
                                db.session.rollback()
                        else:
                            pass  # No valid values from Prophet API, falling back to calculation
                else:
                    pass  # External API returned non-200 status, falling back to calculation
                    
            except Exception as e:
                pass  # Failed to fetch from external Prophet API, falling back to calculation
            
            # If still no forecast data, calculate from historical data
            if not forecast_data:
                if historical_sales:
                    # Convert all Decimal values to float for calculations
                    quantities = [float(s.total_quantity) for s in historical_sales]
                    avg_daily = sum(quantities) / len(quantities)
                    
                    # Apply simple trend detection
                    if len(quantities) >= 7:
                        recent_avg = sum(quantities[-7:]) / 7.0
                        trend_factor = recent_avg / avg_daily if avg_daily > 0 else 1.0
                    else:
                        trend_factor = 1.0
                    
                    # Calculate per-medicine forecast (divide by number of medicines)
                    per_medicine_qty = int(max(0, avg_daily * trend_factor / len(medicine_ids))) if medicine_ids else 0
                    
                    for i in range(days):
                        forecast_date = forecast_start + timedelta(days=i)
                        # Total forecast across all medicines
                        predicted = int(max(0, avg_daily * trend_factor))
                        forecast_data.append({
                            'date': forecast_date.isoformat(),
                            'predicted_quantity': predicted,
                            'source': 'calculated'
                        })
                        
                        # Save calculated forecasts to database for future use
                        for med_id in medicine_ids:
                            existing = MedicineForecast.query.filter_by(
                                medicine_id=med_id,
                                district_id=district.id,
                                forecast_date=forecast_date
                            ).first()
                            
                            if not existing:
                                new_forecast = MedicineForecast(
                                    medicine_id=med_id,
                                    district_id=district.id,
                                    forecast_date=forecast_date,
                                    forecasted_quantity=per_medicine_qty,
                                    model_version='calculated_historical_avg'
                                )
                                db.session.add(new_forecast)
                    
                    try:
                        db.session.commit()
                    except Exception as e:
                        db.session.rollback()
                else:
                    # No historical data and no API data
                    return jsonify({
                        'error': 'No historical sales data available',
                        'hint': 'Add sales records for this area and formula to enable forecasting',
                        'forecast': [],
                        'historical_data': []
                    }), 200
        
        # Prepare historical data (convert Decimal to int)
        historical_data = [{
            'date': sale.date.isoformat(),
            'quantity': int(float(sale.total_quantity))
        } for sale in historical_sales]
        
        # Calculate summary statistics
        total_forecast = sum(f['predicted_quantity'] for f in forecast_data)
        avg_daily_forecast = total_forecast / len(forecast_data) if forecast_data else 0
        
        return jsonify({
            'area': district.name,
            'formula': formula.name,
            'days': days,
            'medicines_count': len(medicines),
            'medicines': [m.brand_name for m in medicines],
            'historical_data': historical_data,
            'forecast': forecast_data,
            'summary': {
                'total_forecast': total_forecast,
                'avg_daily': round(avg_daily_forecast, 2),
                'forecast_start': forecast_start.isoformat(),
                'forecast_end': (forecast_end - timedelta(days=1)).isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Forecast generation failed: {str(e)}',
            'type': type(e).__name__
        }), 500


@forecast_bp.route('/forecast/<medicine_name>', methods=['GET'])
def get_forecast(medicine_name):

    try:
        from forecasting.predict import generate_forecast, generate_forecast_plot
        
        # Get parameters
        periods = request.args.get('periods', 4, type=int)
        include_plot = request.args.get('plot', 'false').lower() == 'true'
        
        # Validate periods
        if periods < 1 or periods > 52:
            return jsonify({'error': 'periods must be between 1 and 52'}), 400
        
        # Construct data path
        base_dir = Path(__file__).resolve().parent.parent
        data_path = base_dir / "forecasting" / "data" / f"{medicine_name.lower()}.csv"
        
        # Check if data file exists
        if not data_path.exists():
            return jsonify({
                'error': f'No historical data found for medicine: {medicine_name}',
                'hint': f'Please add a CSV file at: {data_path}'
            }), 404
        
        # Generate forecast
        if include_plot:
            result, plot_path = generate_forecast_plot(medicine_name, data_path, periods)
            result['plot_path'] = str(plot_path)
        else:
            result = generate_forecast(medicine_name, data_path, periods)
        
        return jsonify(result), 200
        
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except ImportError as e:
        return jsonify({
            'error': 'Forecasting dependencies not installed',
            'hint': 'Run: pip install prophet joblib matplotlib'
        }), 500
    except Exception as e:
        return jsonify({'error': f'Forecasting failed: {str(e)}'}), 500


@forecast_bp.route('/forecast/<medicine_name>/train', methods=['POST'])
def train_forecast_model(medicine_name):

    try:
        from forecasting.train_model import train_forecast_model
        
        # Construct data path
        base_dir = Path(__file__).resolve().parent.parent
        data_path = base_dir / "forecasting" / "data" / f"{medicine_name.lower()}.csv"
        
        # Check if data file exists
        if not data_path.exists():
            return jsonify({
                'error': f'No historical data found for medicine: {medicine_name}',
                'hint': f'Please add a CSV file at: {data_path}'
            }), 404
        
        # Train model
        model_path = train_forecast_model(medicine_name, data_path)
        
        return jsonify({
            'message': f'Model trained successfully for {medicine_name}',
            'model_path': str(model_path)
        }), 200
        
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except ImportError as e:
        return jsonify({
            'error': 'Forecasting dependencies not installed',
            'hint': 'Run: pip install prophet joblib matplotlib'
        }), 500
    except Exception as e:
        return jsonify({'error': f'Model training failed: {str(e)}'}), 500


@forecast_bp.route('/forecast/city', methods=['GET'])
def get_city_forecast():

    try:
        from forecasting.predict import generate_forecast
        
        periods = request.args.get('periods', 4, type=int)
        
        if periods < 1 or periods > 52:
            return jsonify({'error': 'periods must be between 1 and 52'}), 400
        
        # Find all available data files
        base_dir = Path(__file__).resolve().parent.parent
        data_dir = base_dir / "forecasting" / "data"
        
        if not data_dir.exists():
            return jsonify({
                'error': 'No forecasting data available',
                'hint': 'Add historical sales data to backend/forecasting/data/'
            }), 404
        
        # Get all CSV files
        data_files = list(data_dir.glob("*.csv"))
        
        if not data_files:
            return jsonify({
                'error': 'No medicine data available for forecasting',
                'hint': 'Add CSV files to backend/forecasting/data/'
            }), 404
        
        # Aggregate forecasts from all medicines
        total_forecast_by_week = {}
        medicines_count = 0
        medicines_list = []
        
        for data_file in data_files:
            medicine_name = data_file.stem  # filename without extension
            medicines_list.append(medicine_name.title())
            
            try:
                forecast_data = generate_forecast(medicine_name, data_file, periods)
                medicines_count += 1
                
                # Aggregate by week
                for item in forecast_data['forecast']:
                    week = item['ds']
                    if week not in total_forecast_by_week:
                        total_forecast_by_week[week] = {
                            'ds': week,
                            'yhat': 0,
                            'yhat_lower': 0,
                            'yhat_upper': 0,
                            'count': 0
                        }
                    total_forecast_by_week[week]['yhat'] += item['yhat']
                    total_forecast_by_week[week]['yhat_lower'] += item['yhat_lower']
                    total_forecast_by_week[week]['yhat_upper'] += item['yhat_upper']
                    total_forecast_by_week[week]['count'] += 1
                    
            except Exception as e:
                continue
        
        if medicines_count == 0:
            return jsonify({
                'error': 'No trained models available',
                'hint': 'Train models first using POST /api/forecast/<medicine_name>/train'
            }), 404
        
        # Convert to list and sort by date
        forecast_list = sorted(list(total_forecast_by_week.values()), key=lambda x: x['ds'])
        
        # Calculate total forecast
        total_forecast = sum(item['yhat'] for item in forecast_list)
        avg_weekly = total_forecast / len(forecast_list) if forecast_list else 0
        
        return jsonify({
            'city': 'Karachi',
            'periods': periods,
            'medicines_count': medicines_count,
            'medicines': medicines_list,
            'total_forecast': total_forecast,
            'avg_weekly': avg_weekly,
            'forecast': forecast_list
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'City forecast failed: {str(e)}'}), 500


@forecast_bp.route('/forecast/district/<district_name>', methods=['GET'])
def get_district_forecast(district_name):
 
    try:
        from forecasting.predict import generate_forecast
        
        periods = request.args.get('periods', 4, type=int)
        
        if periods < 1 or periods > 52:
            return jsonify({'error': 'periods must be between 1 and 52'}), 400
        
        # Find all available data files
        base_dir = Path(__file__).resolve().parent.parent
        data_dir = base_dir / "forecasting" / "data"
        
        if not data_dir.exists():
            return jsonify({'error': 'No forecasting data available'}), 404
        
        # Get all CSV files
        data_files = list(data_dir.glob("*.csv"))
        
        if not data_files:
            return jsonify({'error': 'No medicine data available'}), 404
        
        # Store individual formula forecasts
        formulas_data = []
        medicines_count = 0
        
        for data_file in data_files:
            medicine_name = data_file.stem
            
            try:
                forecast_data = generate_forecast(medicine_name, data_file, periods)
                medicines_count += 1
                
                # Calculate total forecast for this formula
                total_forecast = sum(item['yhat'] for item in forecast_data['forecast'])
                
                formulas_data.append({
                    'name': medicine_name.title(),
                    'total_forecast': total_forecast,
                    'forecast': forecast_data['forecast']
                })
                    
            except Exception as e:
                continue
        
        if medicines_count == 0:
            return jsonify({'error': 'No trained models available'}), 404
        
        # Sort formulas by total forecast (descending)
        formulas_data.sort(key=lambda x: x['total_forecast'], reverse=True)
        
        return jsonify({
            'district': district_name.title(),
            'periods': periods,
            'medicines_count': medicines_count,
            'formulas': formulas_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'District forecast failed: {str(e)}'}), 500


@forecast_bp.route('/forecast/prophet/fetch', methods=['POST'])
def fetch_and_save_prophet_forecast():
    """
    Fetch forecast from external Prophet API and save to database.
    Request body:
        - area: District/area name (e.g., 'Bahadurabad')
        - formula: Formula name (e.g., 'Paracetamol')
        - days: Number of days to forecast (default: 30)
        - api_url: External API URL (default: 'http://127.0.0.1:5000')
    
    Returns:
        Success message with saved forecast count
    """
    try:
        data = request.get_json()
        area_name = data.get('area')
        formula_name = data.get('formula')
        days = data.get('days', 30)
        api_url = data.get('api_url', 'http://127.0.0.1:5000')
        
        # Validate required parameters
        if not area_name:
            return jsonify({'error': 'area is required'}), 400
        if not formula_name:
            return jsonify({'error': 'formula is required'}), 400
        
        if days < 1 or days > 365:
            return jsonify({'error': 'days must be between 1 and 365'}), 400
        
        # Find district
        district = District.query.filter(func.lower(District.name) == func.lower(area_name)).first()
        if not district:
            return jsonify({'error': f'District not found: {area_name}'}), 404
        
        # Find formula
        formula = Formula.query.filter(func.lower(Formula.name) == func.lower(formula_name)).first()
        if not formula:
            return jsonify({'error': f'Formula not found: {formula_name}'}), 404
        
        # Get medicines for this formula
        medicines = Medicine.query.filter_by(formula_id=formula.id).all()
        if not medicines:
            return jsonify({'error': f'No medicines found for formula: {formula_name}'}), 404
        
        # Make request to external Prophet API
        external_url = f"{api_url}/forecast"
        params = {'area': area_name, 'formula': formula_name, 'days': days}
        
        try:
            response = requests.get(external_url, params=params, timeout=30)
            response.raise_for_status()
            
            # Handle NaN values in JSON by replacing them before parsing
            import json
            import math
            response_text = response.text
            # Replace NaN with null (valid JSON)
            response_text = response_text.replace('NaN', 'null')
            forecast_data = json.loads(response_text)
            
        except requests.exceptions.ConnectionError:
            return jsonify({
                'error': 'Cannot connect to external Prophet API',
                'hint': f'Ensure the Prophet forecast service is running at {api_url}'
            }), 503
        except requests.exceptions.HTTPError as e:
            return jsonify({
                'error': f'External API error: {e.response.status_code}',
                'details': e.response.text[:200]
            }), 502
        except json.JSONDecodeError as e:
            return jsonify({
                'error': 'Invalid JSON from external API',
                'details': str(e)
            }), 502
        
        # Extract forecast dates and values
        if 'forecast' not in forecast_data or 'dates' not in forecast_data['forecast']:
            return jsonify({'error': 'Invalid forecast data format from external API'}), 502
        
        forecast_dates = forecast_data['forecast']['dates']
        forecast_values = forecast_data['forecast']['values']
        
        # Filter out null/None values (previously NaN)
        valid_forecasts = [(date, val) for date, val in zip(forecast_dates, forecast_values) if val is not None]
        
        if not valid_forecasts:
            return jsonify({
                'error': 'No valid forecast values received from external API',
                'hint': 'External Prophet model returned all NaN values. Model needs retraining.'
            }), 502
        
        forecast_dates, forecast_values = zip(*valid_forecasts)
        
        if len(forecast_dates) != len(forecast_values):
            return jsonify({'error': 'Mismatched forecast data'}), 502
        
        # Save forecasts to database for each medicine
        saved_count = 0
        for medicine in medicines:
            for date_str, value in zip(forecast_dates, forecast_values):
                forecast_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                quantity = max(0, int(round(value)))  # Ensure non-negative
                
                # Check if forecast already exists
                existing = MedicineForecast.query.filter_by(
                    medicine_id=medicine.id,
                    district_id=district.id,
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
                        medicine_id=medicine.id,
                        district_id=district.id,
                        forecast_date=forecast_date,
                        forecasted_quantity=quantity,
                        model_version='prophet_external_v1'
                    )
                    db.session.add(new_forecast)
                
                saved_count += 1
        
        db.session.commit()
        
        return jsonify({
            'message': 'Forecast data saved successfully',
            'area': district.name,
            'formula': formula.name,
            'medicines_count': len(medicines),
            'forecasts_saved': saved_count,
            'days': days,
            'total_quantity': forecast_data.get('total_quantity', sum(forecast_values))
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': f'Failed to save forecast: {str(e)}',
            'type': type(e).__name__
        }), 500


@forecast_bp.route('/forecast/prophet', methods=['GET'])
def get_prophet_forecast():
    """
    Get forecast data from database (previously fetched from Prophet API).
    Query params:
        - area: District/area name (e.g., 'Bahadurabad')
        - formula: Formula name (e.g., 'Paracetamol')
        - days: Number of days to forecast (default: 30)
    
    Returns:
        JSON with forecast data from database
    """
    try:
        # Get query parameters
        area_name = request.args.get('area')
        formula_name = request.args.get('formula')
        days = request.args.get('days', 30, type=int)
        
        # Validate required parameters
        if not area_name:
            return jsonify({'error': 'area parameter is required'}), 400
        if not formula_name:
            return jsonify({'error': 'formula parameter is required'}), 400
        
        # Find district
        district = District.query.filter(func.lower(District.name) == func.lower(area_name)).first()
        if not district:
            return jsonify({'error': f'District not found: {area_name}'}), 404
        
        # Find formula
        formula = Formula.query.filter(func.lower(Formula.name) == func.lower(formula_name)).first()
        if not formula:
            return jsonify({'error': f'Formula not found: {formula_name}'}), 404
        
        # Get medicines for this formula
        medicines = Medicine.query.filter_by(formula_id=formula.id).all()
        if not medicines:
            return jsonify({'error': f'No medicines found for formula: {formula_name}'}), 404
        
        medicine_ids = [m.id for m in medicines]
        
        # Get forecasts from database
        forecast_start = datetime.now().date()
        forecast_end = forecast_start + timedelta(days=days)
        
        forecasts = db.session.query(
            MedicineForecast.forecast_date,
            func.sum(MedicineForecast.forecasted_quantity).label('total_quantity')
        ).filter(
            MedicineForecast.medicine_id.in_(medicine_ids),
            MedicineForecast.district_id == district.id,
            MedicineForecast.forecast_date >= forecast_start,
            MedicineForecast.forecast_date < forecast_end
        ).group_by(MedicineForecast.forecast_date).order_by(MedicineForecast.forecast_date).all()
        
        if not forecasts:
            return jsonify({
                'error': 'No forecast data available',
                'hint': 'Use POST /api/forecast/prophet/fetch to fetch and save forecast data first'
            }), 404
        
        # Format response
        forecast_dates = [f.forecast_date.isoformat() for f in forecasts]
        forecast_values = [int(float(f.total_quantity)) for f in forecasts]
        total_quantity = sum(forecast_values)
        
        return jsonify({
            'message': f'You need {total_quantity} units of {formula.name} in {district.name} for the next {len(forecasts)} days',
            'area': district.name,
            'formula': formula.name,
            'total_quantity': total_quantity,
            'forecast': {
                'dates': forecast_dates,
                'values': forecast_values
            },
            'source': 'database',
            'medicines_count': len(medicines)
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Failed to retrieve forecast: {str(e)}',
            'type': type(e).__name__
        }), 500
