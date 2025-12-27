"""
Simple data import script without app initialization
"""
import json
import os
from datetime import date
from dotenv import load_dotenv
from flask import Flask
from database import db
from models import District, Formula, Medicine, MedicineSales, MedicineForecast

load_dotenv()

# Create minimal Flask app
app = Flask(__name__)

# Database configuration from .env
DB_USERNAME = os.getenv('DB_USERNAME')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_NAME = os.getenv('DB_NAME')

app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+mysqlconnector://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)

def import_data():
    """Import backed-up medicine data into new structure"""
    with app.app_context():
        backup_file = 'medicine_data_backup.json'
        
        if not os.path.exists(backup_file):
            print(f"❌ Backup file not found: {backup_file}")
            return
        
        with open(backup_file, 'r') as f:
            old_medicines = json.load(f)
        
        print(f"Importing {len(old_medicines)} medicine records...")
        
        # Create or get default district
        default_district = District.query.filter_by(name='General').first()
        if not default_district:
            default_district = District(name='General', area_code='GEN001')
            db.session.add(default_district)
            db.session.flush()
            print(f"✅ Created default district: {default_district.name}")
        else:
            print(f"✅ Using existing district: {default_district.name}")
        
        # Track created records
        medicine_count = 0
        sales_count = 0
        forecast_count = 0
        formula_map = {}
        
        for old_med in old_medicines:
            try:
                # Get or create Formula
                formula_name = old_med['formula'] or 'Unknown'
                if formula_name not in formula_map:
                    formula = Formula.query.filter_by(name=formula_name).first()
                    if not formula:
                        formula = Formula(name=formula_name)
                        db.session.add(formula)
                        db.session.flush()
                    formula_map[formula_name] = formula.id
                
                formula_id = formula_map[formula_name]
                
                # Create new Medicine
                new_medicine = Medicine(
                    formula_id=formula_id,
                    brand_name=old_med['name'],
                    medicine_id=old_med['medicine_id'],
                    dosage_strength=None
                )
                db.session.add(new_medicine)
                db.session.flush()
                medicine_count += 1
                print(f"✅ Created medicine: {new_medicine.brand_name} ({new_medicine.medicine_id})")
                
                # Create MedicineSales record
                if old_med['stock'] and old_med['stock'] > 0:
                    sales = MedicineSales(
                        medicine=new_medicine,
                        district=default_district,
                        date=date.today(),
                        quantity=old_med['stock']
                    )
                    db.session.add(sales)
                    db.session.flush()
                    sales_count += 1
                    print(f"  ✅ Created sales record: {old_med['stock']} units")
                
                # Create MedicineForecast record
                if old_med['forecast'] and old_med['forecast'] > 0:
                    forecast = MedicineForecast(
                        medicine=new_medicine,
                        district=default_district,
                        forecast_date=date.today(),
                        forecasted_quantity=old_med['forecast'],
                        model_version='legacy_v1'
                    )
                    db.session.add(forecast)
                    db.session.flush()
                    forecast_count += 1
                    print(f"  ✅ Created forecast record: {old_med['forecast']} units")
                
            except Exception as e:
                print(f"❌ Error importing medicine {old_med['name']}: {e}")
                db.session.rollback()
                continue
        
        try:
            db.session.commit()
            print(f"\n✅ Migration Complete!")
            print(f"   Medicines: {medicine_count}")
            print(f"   Sales Records: {sales_count}")
            print(f"   Forecast Records: {forecast_count}")
        except Exception as e:
            print(f"❌ Error committing data: {e}")
            db.session.rollback()

if __name__ == '__main__':
    import_data()
