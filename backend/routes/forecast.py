"""Forecasting routes - medicine sales predictions"""
from flask import Blueprint, request, jsonify
from pathlib import Path
from datetime import datetime, timedelta
from models import MedicineSales, MedicineForecast, Medicine, District, Formula
from database import db
from sqlalchemy import func

forecast_bp = Blueprint('forecast', __name__)

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
        
        # Get all medicines with this formula in this district
        medicines = Medicine.query.filter_by(formula_id=formula.id).all()
        
        if not medicines:
            return jsonify({
                'error': f'No medicines found for formula "{formula.name}" in district "{district.name}"',
                'hint': 'Add medicines for this formula first'
            }), 404
        
        # Collect historical sales data for these medicines in this district
        medicine_ids = [m.id for m in medicines]
        
        # Get historical sales (last 90 days for context)
        historical_start = datetime.now().date() - timedelta(days=90)
        historical_sales = db.session.query(
            MedicineSales.date,
            func.sum(MedicineSales.quantity).label('total_quantity')
        ).filter(
            MedicineSales.medicine_id.in_(medicine_ids),
            MedicineSales.district_id == district.id,
            MedicineSales.date >= historical_start
        ).group_by(MedicineSales.date).order_by(MedicineSales.date).all()
        
        # Check if we have existing forecasts
        forecast_start = datetime.now().date()
        forecast_end = forecast_start + timedelta(days=days)
        
        existing_forecasts = db.session.query(
            MedicineForecast.forecast_date,
            func.sum(MedicineForecast.forecasted_quantity).label('total_forecast')
        ).filter(
            MedicineForecast.medicine_id.in_(medicine_ids),
            MedicineForecast.district_id == district.id,
            MedicineForecast.forecast_date >= forecast_start,
            MedicineForecast.forecast_date < forecast_end
        ).group_by(MedicineForecast.forecast_date).order_by(MedicineForecast.forecast_date).all()
        
        # If no forecasts exist, generate simple moving average forecast
        forecast_data = []
        if existing_forecasts:
            # Use existing forecasts (convert Decimal to float/int)
            for forecast in existing_forecasts:
                forecast_data.append({
                    'date': forecast.forecast_date.isoformat(),
                    'predicted_quantity': int(float(forecast.total_forecast)),
                    'source': 'stored'
                })
        else:
            # Generate simple forecast using historical average
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
                
                for i in range(days):
                    forecast_date = forecast_start + timedelta(days=i)
                    # Simple forecast with trend
                    predicted = int(avg_daily * trend_factor)
                    forecast_data.append({
                        'date': forecast_date.isoformat(),
                        'predicted_quantity': predicted,
                        'source': 'calculated'
                    })
            else:
                return jsonify({
                    'error': 'Insufficient historical data to generate forecast',
                    'hint': 'Add sales records for this area and formula first'
                }), 404
        
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
                print(f"Warning: Could not generate forecast for {medicine_name}: {e}")
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
                print(f"Warning: Could not generate forecast for {medicine_name}: {e}")
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
