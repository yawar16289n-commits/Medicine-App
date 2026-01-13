"""
Populate district_medicine_lookup table from existing sales data

This script reads all unique district-medicine-formula combinations
from the medicine_sales table and populates the district_medicine_lookup table.

Usage:
    python populate_district_lookup.py
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from database import db
from models import MedicineSales, Medicine, DistrictMedicineLookup
from app import create_app


def populate_lookup_table():
    """Populate district_medicine_lookup from existing sales data"""
    
    print("=" * 70)
    print("POPULATE DISTRICT MEDICINE LOOKUP TABLE")
    print("=" * 70)
    print()
    
    # Get all unique district-medicine combinations from sales
    print("Step 1: Fetching unique district-medicine combinations from sales...")
    
    sales_combinations = db.session.query(
        MedicineSales.district_id,
        MedicineSales.medicine_id
    ).distinct().all()
    
    print(f"Found {len(sales_combinations)} unique combinations in sales data")
    print()
    
    if not sales_combinations:
        print("⚠️  No sales data found. Create some sales records first.")
        return
    
    # Process each combination
    print("Step 2: Adding entries to district_medicine_lookup table...")
    print()
    
    added = 0
    skipped = 0
    errors = 0
    
    for district_id, medicine_id in sales_combinations:
        try:
            # Get medicine to get formula_id
            medicine = Medicine.query.get(medicine_id)
            
            if not medicine or not medicine.formula_id:
                print(f"⚠️  Skipping: medicine_id={medicine_id} (no formula)")
                errors += 1
                continue
            
            # Check if entry already exists
            existing = DistrictMedicineLookup.query.filter_by(
                district_id=district_id,
                medicine_id=medicine_id,
                formula_id=medicine.formula_id
            ).first()
            
            if existing:
                skipped += 1
            else:
                # Create new lookup entry
                lookup_entry = DistrictMedicineLookup(
                    district_id=district_id,
                    medicine_id=medicine_id,
                    formula_id=medicine.formula_id
                )
                db.session.add(lookup_entry)
                added += 1
                
                # Get names for display
                district_name = lookup_entry.district.name if lookup_entry.district else f"ID:{district_id}"
                medicine_name = medicine.brand_name
                formula_name = medicine.formula.name if medicine.formula else f"ID:{medicine.formula_id}"
                
                print(f"✅ Added: {district_name} - {medicine_name} ({formula_name})")
        
        except Exception as e:
            print(f"❌ Error processing district_id={district_id}, medicine_id={medicine_id}: {str(e)}")
            errors += 1
            continue
    
    # Commit all changes
    try:
        db.session.commit()
        print()
        print("=" * 70)
        print("SUMMARY")
        print("=" * 70)
        print(f"Total combinations found: {len(sales_combinations)}")
        print(f"New entries added: {added}")
        print(f"Already existed (skipped): {skipped}")
        print(f"Errors: {errors}")
        print()
        print("✅ District medicine lookup table populated successfully!")
        
    except Exception as e:
        db.session.rollback()
        print()
        print("❌ Error committing changes to database:")
        print(f"   {str(e)}")
        return


def verify_lookup_table():
    """Show current state of lookup table"""
    print()
    print("=" * 70)
    print("VERIFICATION - Current Lookup Table Entries")
    print("=" * 70)
    print()
    
    entries = DistrictMedicineLookup.query.all()
    
    if not entries:
        print("⚠️  Lookup table is empty")
        return
    
    print(f"Total entries: {len(entries)}")
    print()
    print("District | Medicine | Formula")
    print("-" * 70)
    
    for entry in entries[:20]:  # Show first 20
        district_name = entry.district.name if entry.district else f"ID:{entry.district_id}"
        medicine_name = entry.medicine.brand_name if entry.medicine else f"ID:{entry.medicine_id}"
        formula_name = entry.formula.name if entry.formula else f"ID:{entry.formula_id}"
        print(f"{district_name} | {medicine_name} | {formula_name}")
    
    if len(entries) > 20:
        print(f"... and {len(entries) - 20} more entries")


def main():
    """Main function"""
    app = create_app()
    
    with app.app_context():
        try:
            populate_lookup_table()
            verify_lookup_table()
            
        except KeyboardInterrupt:
            print("\n\n⚠️  Interrupted by user")
            sys.exit(1)
        except Exception as e:
            print(f"\n\n❌ Fatal error: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            sys.exit(1)


if __name__ == '__main__':
    main()
