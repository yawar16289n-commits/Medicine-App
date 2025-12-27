"""
Fix duplicate medicine_ids before migration
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from database import db

def fix_duplicate_medicine_ids():
    """Fix duplicate medicine_ids by making them unique"""
    app = create_app()
    with app.app_context():
        # Get all medicines
        result = db.session.execute(db.text("""
            SELECT id, medicine_id FROM medicine
        """))
        
        medicines = list(result)
        print(f"Found {len(medicines)} medicine records")
        
        # Update each with unique medicine_id
        for idx, (med_id, old_medicine_id) in enumerate(medicines, 1):
            new_medicine_id = f"MED{idx:04d}"
            db.session.execute(db.text("""
                UPDATE medicine SET medicine_id = :new_id WHERE id = :id
            """), {"new_id": new_medicine_id, "id": med_id})
            print(f"Updated medicine ID {med_id}: {old_medicine_id} → {new_medicine_id}")
        
        db.session.commit()
        print(f"\n✅ Fixed {len(medicines)} medicine IDs")

if __name__ == '__main__':
    fix_duplicate_medicine_ids()
