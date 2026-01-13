# District Medicine Lookup Auto-Management

## Overview
The `district_medicine_lookup` table is now automatically managed based on sales operations. This ensures the lookup table always reflects which medicine-formula combinations exist in which districts based on actual sales data.

## How It Works

### 1. When Sales Are Added or Updated
- **POST /api/medicines/sales** (manual entry)
- **POST /api/medicines/sales/upload** (CSV/Excel upload)

**Behavior:**
- After creating or updating a sales record, the system checks if the (district_id, medicine_id, formula_id) combination exists in `district_medicine_lookup`
- **If it exists:** Do nothing (ignore)
- **If it doesn't exist:** Create a new row in the lookup table

### 2. When Sales Are Deleted
- **DELETE /api/medicines/sales/<id>** (new endpoint)

**Behavior:**
- Before deleting a sales record, the system checks if there are any OTHER sales records with the same (district_id, medicine_id, formula_id) combination
- **If other records exist:** Leave the lookup table entry as is
- **If no other records exist:** Delete the corresponding entry from the lookup table

## Implementation Details

### Helper Functions
Two helper functions in `backend/routes/medicines.py`:

1. **`ensure_district_medicine_lookup(district_id, medicine_id, formula_id)`**
   - Checks if the combination exists in lookup table
   - Creates new entry if it doesn't exist
   - Returns True if created, False if already exists

2. **`cleanup_district_medicine_lookup(district_id, medicine_id, formula_id)`**
   - Checks if any other sales records exist for this combination
   - Deletes lookup entry only if no other sales exist
   - Returns True if deleted, False otherwise

### Updated Endpoints

#### Create/Update Sales (POST /api/medicines/sales)
- Added call to `ensure_district_medicine_lookup()` after sales record is saved
- Ensures lookup table entry exists for every active sales combination

#### Upload Sales Data (POST /api/medicines/sales/upload)
- Added call to `ensure_district_medicine_lookup()` for each processed row
- Bulk uploads automatically populate lookup table

#### Delete Sales Record (DELETE /api/medicines/sales/<id>) - NEW
- Restores stock to the medicine
- Calls `cleanup_district_medicine_lookup()` to remove orphaned entries
- Logs activity for audit trail
- Returns: `{"message": "Sales record deleted successfully", "restoredStock": <quantity>}`

## Benefits

1. **Automatic Maintenance**: No manual intervention needed to keep lookup table current
2. **Data Integrity**: Lookup table always reflects actual sales data
3. **Forecast Accuracy**: Forecast endpoints rely on this lookup table for district-formula filtering
4. **Stock Management**: Delete operation properly restores stock levels
5. **Audit Trail**: All operations are logged via activity logger

## Database Schema

### district_medicine_lookup Table
```sql
- id (PK, auto-increment)
- district_id (FK -> district.id)
- medicine_id (FK -> medicine.id)
- formula_id (FK -> formula.id)
- created_at (timestamp)
- UNIQUE INDEX on (district_id, medicine_id, formula_id)
```

### medicine_sales Table
```sql
- id (PK, auto-increment)
- medicine_id (FK -> medicine.id)
- district_id (FK -> district.id)
- date (date)
- quantity (integer)
- created_at (timestamp)
- INDEX on (medicine_id, district_id, date)
```

## Usage Examples

### Example 1: Creating a Sale
```http
POST /api/medicines/sales
{
  "medicineId": 5,
  "districtId": 2,
  "date": "2026-01-12",
  "saleQuantity": 100
}
```
**Result:** Sales record created + lookup entry ensured for (district=2, medicine=5, formula=<medicine's formula>)

### Example 2: Deleting a Sale
```http
DELETE /api/medicines/sales/123
```
**Result:** 
- Sales record #123 deleted
- Stock restored to medicine
- If no other sales exist for that district-medicine-formula combo, lookup entry is removed

### Example 3: Uploading Sales
```http
POST /api/medicines/sales/upload
Content-Type: multipart/form-data
file: sales_data.xlsx
```
**Result:** Each processed row creates/updates sales record + ensures lookup entry exists

## Migration Notes

If you have existing sales data, you may want to populate the lookup table retroactively:

```sql
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
);
```

## Testing

To verify the implementation:
1. Create a sales record → Check lookup table has entry
2. Create another sale for same district-medicine-formula → Verify no duplicate in lookup
3. Delete one sale → Verify lookup entry still exists
4. Delete the last sale for that combination → Verify lookup entry is removed
5. Upload sales file → Verify all combinations are in lookup table
