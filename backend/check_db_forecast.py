"""Check forecast data in database"""
from app import create_app
from models import MedicineForecast, Medicine, District
from database import db

app = create_app()
with app.app_context():
    district = District.query.filter_by(name='Bahadurabad').first()
    medicine = Medicine.query.filter_by(brand_name='Norvasc').first()
    
    if district and medicine:
        print(f'District: {district.id} - {district.name}')
        print(f'Medicine: {medicine.id} - {medicine.brand_name}')
        
        forecasts = MedicineForecast.query.filter_by(
            district_id=district.id,
            medicine_id=medicine.id
        ).order_by(MedicineForecast.forecast_date).limit(15).all()
        
        print(f'\nFound {len(forecasts)} forecast records:')
        for f in forecasts:
            print(f'  {f.forecast_date}: {f.forecasted_quantity}')
