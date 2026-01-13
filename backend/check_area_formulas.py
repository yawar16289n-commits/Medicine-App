"""Quick script to check what formulas are returned for a specific area"""
from models import District, Formula, DistrictMedicineLookup
from database import db
from app import create_app
from sqlalchemy import func

app = create_app()

with app.app_context():
    # Get all districts
    districts = District.query.limit(5).all()
    print("Sample Districts:")
    for d in districts:
        print(f"  {d.id}: {d.name}")
    
    # Check formulas for first district
    if districts:
        test_district = districts[0]
        print(f"\n\nChecking formulas for: {test_district.name}")
        
        # This is what the backend API does
        formulas = db.session.query(Formula).join(
            DistrictMedicineLookup, Formula.id == DistrictMedicineLookup.formula_id
        ).join(
            District, DistrictMedicineLookup.district_id == District.id
        ).filter(func.lower(District.name) == func.lower(test_district.name)).distinct().all()
        
        print(f"Found {len(formulas)} formulas:")
        for f in formulas:
            print(f"  - {f.name}")
        
        # Check lookup entries for this district
        print(f"\n\nLookup entries for {test_district.name}:")
        lookup_entries = DistrictMedicineLookup.query.filter_by(district_id=test_district.id).limit(5).all()
        for entry in lookup_entries:
            print(f"  District: {entry.district_id}, Medicine: {entry.medicine_id}, Formula: {entry.formula_id}")
