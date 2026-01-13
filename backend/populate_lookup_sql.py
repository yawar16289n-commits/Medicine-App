"""
Simple SQL-based population of district_medicine_lookup table
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from database import db
from app import create_app

def populate_with_sql():
    """Populate using raw SQL to avoid model issues"""
    
    print("=" * 70)
    print("POPULATE DISTRICT MEDICINE LOOKUP TABLE (SQL)")
    print("=" * 70)
    print()
    
    sql = """
    INSERT INTO district_medicine_lookup (district_id, medicine_id, formula_id)
    SELECT DISTINCT 
        ms.district_id, 
        ms.medicine_id, 
        m.formula_id
    FROM medicine_sales ms
    JOIN medicine m ON ms.medicine_id = m.id
    WHERE NOT EXISTS (
        SELECT 1 FROM district_medicine_lookup dml
        WHERE dml.district_id = ms.district_id
        AND dml.medicine_id = ms.medicine_id
        AND dml.formula_id = m.formula_id
    )
    """
    
    try:
        result = db.session.execute(db.text(sql))
        db.session.commit()
        rows_inserted = result.rowcount
        
        print(f"✅ Successfully inserted {rows_inserted} new entries")
        print()
        
        # Count total entries
        count_sql = "SELECT COUNT(*) as total FROM district_medicine_lookup"
        result = db.session.execute(db.text(count_sql))
        total = result.fetchone()[0]
        
        print(f"📊 Total entries in lookup table: {total}")
        print()
        print("✅ Done!")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        populate_with_sql()
