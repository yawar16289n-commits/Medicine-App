"""
Weather API Routes
Endpoints for weather data and forecast management
"""
from flask import Blueprint, jsonify, request, g
from middleware.auth import require_auth, require_role
from services.weather_service import update_weather_database, get_weather_data

weather_bp = Blueprint('weather', __name__)


@weather_bp.route('/weather', methods=['GET'])
def get_weather():
    """
    Get weather data (historical + forecast)
    Query params:
        - days: Number of days of historical data (default: 365)
        - include_forecast: Whether to include forecast (default: true)
    """
    try:
        days = request.args.get('days', 365, type=int)
        include_forecast = request.args.get('include_forecast', 'true').lower() == 'true'
        
        weather_data = get_weather_data(days=days, include_forecast=include_forecast)
        
        return jsonify({
            'success': True,
            'data': weather_data,
            'count': len(weather_data)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@weather_bp.route('/weather/forecast', methods=['GET'])
def get_forecast_only():
    """
    Get only forecast data (next 14 days)
    """
    try:
        weather_data = get_weather_data(days=0, include_forecast=True)
        # Filter only forecast records
        forecast_data = [record for record in weather_data if record.get('isForecast')]
        
        return jsonify({
            'success': True,
            'data': forecast_data,
            'count': len(forecast_data)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@weather_bp.route('/weather/update', methods=['POST'])
@require_auth
@require_role(['admin', 'analyst'])
def trigger_weather_update(**kwargs):
    """
    Manually trigger weather forecast update
    Requires admin or analyst role
    """
    try:
        g.current_user = kwargs.get('current_user')
        records_updated = update_weather_database()
        
        return jsonify({
            'success': True,
            'message': f'Successfully updated {records_updated} weather forecast records',
            'records_updated': records_updated
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@weather_bp.route('/weather/upload', methods=['POST'])
@require_auth
@require_role(['admin', 'analyst'])
def upload_weather_data(**kwargs):
    """
    Upload weather data from Excel/CSV file
    Expected columns: date, apparent_temperature_max, apparent_temperature_min, 
                     apparent_temperature_mean, relative_humidity_2m_mean,
                     relative_humidity_2m_max, relative_humidity_2m_min
    """
    import pandas as pd
    from datetime import datetime
    from models import WeatherData
    from database import db
    
    try:
        g.current_user = kwargs.get('current_user')
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Read Excel or CSV file
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file)
        else:
            return jsonify({'success': False, 'error': 'Invalid file format. Use CSV or Excel'}), 400
        
        # Normalize column names (lowercase, strip spaces)
        df.columns = df.columns.str.lower().str.strip()
        
        # Required columns
        required_cols = [
            'date', 'apparent_temperature_max', 'apparent_temperature_min',
            'apparent_temperature_mean', 'relative_humidity_2m_mean',
            'relative_humidity_2m_max', 'relative_humidity_2m_min'
        ]
        
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            return jsonify({
                'success': False,
                'error': f'Missing required columns: {", ".join(missing_cols)}'
            }), 400
        
        # Process and insert data
        records_added = 0
        records_updated = 0
        errors = []
        
        for idx, row in df.iterrows():
            try:
                # Parse date
                if isinstance(row['date'], str):
                    date_obj = datetime.strptime(row['date'], '%Y-%m-%d').date()
                else:
                    date_obj = pd.to_datetime(row['date']).date()
                
                # Check if record exists
                existing = WeatherData.query.filter_by(date=date_obj).first()
                
                weather_data = {
                    'date': date_obj,
                    'latitude': 24.8607,  # Karachi coordinates
                    'longitude': 67.0011,
                    'apparent_temperature_max': float(row['apparent_temperature_max']),
                    'apparent_temperature_min': float(row['apparent_temperature_min']),
                    'apparent_temperature_mean': float(row['apparent_temperature_mean']),
                    'relative_humidity_2m_mean': float(row['relative_humidity_2m_mean']),
                    'relative_humidity_2m_max': float(row['relative_humidity_2m_max']),
                    'relative_humidity_2m_min': float(row['relative_humidity_2m_min']),
                    'is_forecast': True  # Manual uploads treated as forecast
                }
                
                if existing:
                    # Update existing record
                    for key, value in weather_data.items():
                        if key != 'date':
                            setattr(existing, key, value)
                    records_updated += 1
                else:
                    # Create new record
                    new_weather = WeatherData(**weather_data)
                    db.session.add(new_weather)
                    records_added += 1
                    
            except Exception as e:
                errors.append(f"Row {idx + 2}: {str(e)}")
        
        db.session.commit()
        
        message = f'Successfully added {records_added} and updated {records_updated} weather records'
        if errors:
            message += f'. {len(errors)} errors occurred.'
        
        return jsonify({
            'success': True,
            'message': message,
            'records_added': records_added,
            'records_updated': records_updated,
            'errors': errors[:10]  # Return first 10 errors
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@weather_bp.route('/weather/template', methods=['GET'])
@require_auth
def download_weather_template(**kwargs):
    """
    Download Excel template for weather data upload
    """
    import pandas as pd
    from io import BytesIO
    from flask import send_file
    from datetime import datetime, timedelta
    
    try:
        g.current_user = kwargs.get('current_user')
        # Create sample data for next 14 days
        today = datetime.now().date()
        dates = [today + timedelta(days=i) for i in range(14)]
        
        template_data = {
            'date': [d.strftime('%Y-%m-%d') for d in dates],
            'apparent_temperature_max': [''] * 14,
            'apparent_temperature_min': [''] * 14,
            'apparent_temperature_mean': [''] * 14,
            'relative_humidity_2m_mean': [''] * 14,
            'relative_humidity_2m_max': [''] * 14,
            'relative_humidity_2m_min': [''] * 14,
        }
        
        df = pd.DataFrame(template_data)
        
        # Try Excel generation first; if it fails (e.g., openpyxl missing), fallback to CSV
        try:
            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Weather Data')
                worksheet = writer.sheets['Weather Data']
                for col in worksheet.columns:
                    max_length = max(len(str(cell.value)) for cell in col)
                    worksheet.column_dimensions[col[0].column_letter].width = max_length + 2
            output.seek(0)
            return send_file(
                output,
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                as_attachment=True,
                download_name='weather_data_template.xlsx'
            )
        except Exception:
            # Fallback to CSV template
            csv_output = BytesIO()
            df.to_csv(csv_output, index=False)
            csv_output.seek(0)
            return send_file(
                csv_output,
                mimetype='text/csv',
                as_attachment=True,
                download_name='weather_data_template.csv'
            )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
