"""Seed Bahadurabad district with sample forecast data"""
from app import create_app
from database import db
from models import District, Formula, Medicine, MedicineSales
from datetime import datetime, timedelta
import random

app = create_app()

with app.app_context():
    # Create Bahadurabad district
    bahadurabad = District.query.filter_by(name='Bahadurabad').first()
    if not bahadurabad:
        bahadurabad = District(name='Bahadurabad', area_code='BHD01')
        db.session.add(bahadurabad)
        db.session.commit()
        print(f"✓ Created district: {bahadurabad.name}")
    else:
        print(f"✓ District exists: {bahadurabad.name}")
    
    # Create Acetylsalicylic Acid formula
    formula = Formula.query.filter_by(name='Acetylsalicylic Acid').first()
    if not formula:
        formula = Formula(name='Acetylsalicylic Acid', therapeutic_class='Analgesic')
        db.session.add(formula)
        db.session.commit()
        print(f"✓ Created formula: {formula.name}")
    else:
        print(f"✓ Formula exists: {formula.name}")
    
    # Create medicines
    medicines_data = [
        {'brand': 'Aspirin', 'id': 'ASP001', 'dosage': '100mg'},
        {'brand': 'Disprin', 'id': 'DSP001', 'dosage': '300mg'},
        {'brand': 'Ecosprin', 'id': 'ECO001', 'dosage': '75mg'}
    ]
    
    medicines = []
    for med_data in medicines_data:
        medicine = Medicine.query.filter_by(medicine_id=med_data['id']).first()
        if not medicine:
            medicine = Medicine(
                formula_id=formula.id,
                brand_name=med_data['brand'],
                medicine_id=med_data['id'],
                dosage_strength=med_data['dosage'],
                therapeutic_class='Analgesic',
                stock_level=1000
            )
            db.session.add(medicine)
            medicines.append(medicine)
            print(f"✓ Created medicine: {med_data['brand']}")
        else:
            medicines.append(medicine)
            print(f"✓ Medicine exists: {med_data['brand']}")
    
    db.session.commit()
    
    # Generate 90 days of historical sales data
    print("\nGenerating historical sales data...")
    start_date = datetime.now().date() - timedelta(days=90)
    
    sales_added = 0
    for i in range(90):
        current_date = start_date + timedelta(days=i)
        
        for medicine in medicines:
            # Check if sales record exists
            existing = MedicineSales.query.filter_by(
                medicine_id=medicine.id,
                district_id=bahadurabad.id,
                date=current_date
            ).first()
            
            if not existing:
                # Generate realistic sales with some variation and trend
                base_quantity = 50 + (i // 10)  # Slight upward trend
                daily_variance = random.randint(-10, 20)
                quantity = max(10, base_quantity + daily_variance)
                
                sale = MedicineSales(
                    medicine_id=medicine.id,
                    district_id=bahadurabad.id,
                    date=current_date,
                    quantity=quantity
                )
                db.session.add(sale)
                sales_added += 1
    
    db.session.commit()
    print(f"✓ Added {sales_added} sales records")
    
    print("\n✅ Bahadurabad forecast data ready!")
    print(f"   District: {bahadurabad.name}")
    print(f"   Formula: {formula.name}")
    print(f"   Medicines: {len(medicines)}")
    print(f"   Sales records: {sales_added}")
    print("\nYou can now view forecast for:")
    print(f"   Area: Bahadurabad")
    print(f"   Formula: Acetylsalicylic_Acid")
