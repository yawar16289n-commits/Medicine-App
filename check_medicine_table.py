import sys
sys.path.insert(0, 'backend')
from database import db
from app import create_app
from models import Medicine, District

app = create_app()
app.app_context().push()

# Check current medicine table structure
result = db.session.execute(db.text('DESCRIBE medicine'))
print("Current medicine table structure:")
for row in result:
    print(row)

print("\n" + "="*50 + "\n")

# Check if district_id column exists
columns = [row[0] for row in db.session.execute(db.text('SHOW COLUMNS FROM medicine'))]
print(f"Columns: {columns}")

if 'district_id' in columns:
    print("\n✓ district_id column exists")
    # Check if medicines have district_id values
    meds_without_district = db.session.execute(db.text('SELECT COUNT(*) FROM medicine WHERE district_id IS NULL')).scalar()
    print(f"Medicines without district_id: {meds_without_district}")
    
    if meds_without_district > 0:
        # Get first district
        district = District.query.first()
        if district:
            print(f"\nUpdating {meds_without_district} medicines to use district: {district.name} (ID: {district.id})")
            db.session.execute(db.text(f'UPDATE medicine SET district_id = {district.id} WHERE district_id IS NULL'))
            db.session.commit()
            print("✓ Updated successfully")
else:
    print("\n✗ district_id column does NOT exist - migration needed")
