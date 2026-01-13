"""Quick check of medicine_forecast table"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from database import db
from app import create_app

app = create_app()
with app.app_context():
    result = db.session.execute(db.text("SELECT COUNT(*) as total FROM medicine_forecast"))
    total = result.fetchone()[0]
    print(f"Total forecast records: {total}")
    
    if total > 0:
        result = db.session.execute(db.text("""
            SELECT model_version, COUNT(*) as count, MAX(created_at) as latest
            FROM medicine_forecast 
            GROUP BY model_version
        """))
        print("\nBy model version:")
        for row in result:
            print(f"  {row[0]}: {row[1]} records (latest: {row[2]})")
