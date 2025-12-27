"""
Data Migration Script - Transfer existing medicine data to new district-based structure
Run this BEFORE applying the database migration
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from database import db
from datetime import date

# Import OLD model structure (before migration)
class OldMedicine(db.Model):
    __tablename__ = 'medicine'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.Integer, primary_key=True)
    formula = db.Column(db.String(100))
    medicine_id = db.Column(db.String(50))
    name = db.Column(db.String(100))
    stock = db.Column(db.Integer)
    forecast = db.Column(db.Integer)
    stock_status = db.Column(db.String(50))


def export_old_data():
    """Export existing medicine data to a backup file using raw SQL"""
    app = create_app()
    with app.app_context():
        # Use raw SQL to query old table structure
        result = db.session.execute(db.text("""
            SELECT id, formula, medicine_id, name, stock, forecast, stock_status 
            FROM medicine
        """))
        
        data = []
        for row in result:
            data.append({
                'id': row[0],
                'formula': row[1],
                'medicine_id': row[2],
                'name': row[3],
                'stock': row[4],
                'forecast': row[5],
                'stock_status': row[6]
            })
        
        if not data:
            print("No existing medicine data found to export")
            return []
        
        print(f"✅ Exported {len(data)} medicine records")
        
        # Save to file as backup
        import json
        with open('medicine_data_backup.json', 'w') as f:
            json.dump(data, f, indent=2)
        print(f"✅ Backup saved to medicine_data_backup.json")
        
        return data


def import_to_new_structure():
    """
    Import data into new structure after migration is applied
    This should be run AFTER 'flask db upgrade'
    """
    import json
    from models import District, Formula, Medicine, MedicineSales, MedicineForecast
    
    # Load backup data
    if not os.path.exists('medicine_data_backup.json'):
        print("❌ No backup file found. Run export_old_data() first")
        return
    
    with open('medicine_data_backup.json', 'r') as f:
        old_data = json.load(f)
    
    app = create_app()
    with app.app_context():
        print(f"Importing {len(old_data)} medicine records...")
        
        # Create default district if not exists
        default_district = District.query.filter_by(name='General').first()
        if not default_district:
            default_district = District(name='General', area_code='GEN')
            db.session.add(default_district)
            db.session.commit()
            print("✅ Created default district: General")
        
        formula_map = {}  # Track formulas we've created
        medicine_count = 0
        sales_count = 0
        forecast_count = 0
        
        for old_med in old_data:
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
                    dosage_strength=None  # No dosage in old data
                )
                db.session.add(new_medicine)
                db.session.flush()
                medicine_count += 1
                
                # Create MedicineSales record (current stock as sales)
                if old_med['stock'] and old_med['stock'] > 0:
                    sales = MedicineSales(
                        medicine=new_medicine,
                        district=default_district,
                        date=date.today(),
                        quantity=old_med['stock']
                    )
                    db.session.add(sales)
                    sales_count += 1
                
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
                    forecast_count += 1
                
            except Exception as e:
                print(f"❌ Error importing medicine {old_med['name']}: {e}")
                continue
        
        db.session.commit()
        print(f"\n✅ Migration Complete!")
        print(f"   - {len(formula_map)} formulas created")
        print(f"   - {medicine_count} medicines imported")
        print(f"   - {sales_count} sales records created")
        print(f"   - {forecast_count} forecast records created")


if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'import':
        import_to_new_structure()
    else:
        print("=" * 60)
        print("MEDICINE DATA MIGRATION")
        print("=" * 60)
        print("\nStep 1: Exporting existing data...")
        export_old_data()
        print("\n" + "=" * 60)
        print("NEXT STEPS:")
        print("1. Review the backup file: medicine_data_backup.json")
        print("2. Apply migration: flask db upgrade")
        print("3. Run: python migrate_medicine_data.py import")
        print("=" * 60)
