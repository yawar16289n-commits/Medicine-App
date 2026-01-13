# Quick Reference: District Medicine Lookup Auto-Management

## What Changed?

### ✅ New Features
1. **Automatic Lookup Table Management**: `district_medicine_lookup` is now automatically populated
2. **New DELETE Endpoint**: Can now delete sales records via API
3. **Stock Restoration**: Deleting sales restores stock levels
4. **Smart Cleanup**: Lookup entries removed only when no sales exist

### 📝 Modified Files
- `backend/routes/medicines.py`: Added helper functions and DELETE endpoint

### 🆕 New Endpoints
```http
DELETE /api/medicines/sales/<id>
Authorization: Bearer <token>

Response 200:
{
  "message": "Sales record deleted successfully",
  "restoredStock": 50
}
```

### 📊 Existing Endpoints (Enhanced)
```http
# These now auto-manage lookup table:
POST /api/medicines/sales
POST /api/medicines/sales/upload
```

## Helper Functions

### `ensure_district_medicine_lookup(district_id, medicine_id, formula_id)`
- **When**: After creating/updating sales
- **What**: Creates lookup entry if doesn't exist
- **Returns**: True if created, False if already exists

### `cleanup_district_medicine_lookup(district_id, medicine_id, formula_id)`
- **When**: After deleting sales
- **What**: Removes lookup entry if no other sales exist
- **Returns**: True if deleted, False if kept

## Testing Checklist

### Manual Test Scenarios
- [ ] Create a sale → Verify lookup entry added
- [ ] Create duplicate sale (same district-medicine-formula) → Verify no duplicate in lookup
- [ ] Update existing sale → Verify lookup entry unchanged
- [ ] Delete one of multiple sales → Verify lookup entry remains
- [ ] Delete last sale for a combination → Verify lookup entry removed
- [ ] Upload sales file → Verify all combinations in lookup table
- [ ] Check stock levels after deletion → Verify stock restored

### SQL Verification Queries
```sql
-- View current lookup table
SELECT 
    dml.id,
    d.name as district,
    m.brand_name as medicine,
    f.name as formula,
    dml.created_at
FROM district_medicine_lookup dml
JOIN district d ON dml.district_id = d.id
JOIN medicine m ON dml.medicine_id = m.id
JOIN formula f ON dml.formula_id = f.id
ORDER BY d.name, f.name, m.brand_name;

-- Check orphaned entries (shouldn't exist)
SELECT dml.*
FROM district_medicine_lookup dml
LEFT JOIN medicine_sales ms ON 
    dml.district_id = ms.district_id AND 
    dml.medicine_id = ms.medicine_id
WHERE ms.id IS NULL;

-- Count combinations
SELECT 
    d.name as district,
    f.name as formula,
    COUNT(DISTINCT dml.medicine_id) as medicine_count
FROM district_medicine_lookup dml
JOIN district d ON dml.district_id = d.id
JOIN formula f ON dml.formula_id = f.id
GROUP BY d.name, f.name
ORDER BY d.name, f.name;
```

## Impact on Existing Features

### ✅ Forecast Module
- **Before**: Manual population of lookup table required
- **After**: Automatically uses current sales data
- **Benefit**: Forecasts always based on actual district-medicine availability

### ✅ District Filtering
- **Before**: May show districts without actual sales data
- **After**: Only shows districts with confirmed sales history
- **Benefit**: More accurate and relevant data

### ✅ Formula Availability
- **Before**: Manual tracking of which formulas are in which districts
- **After**: Automatic tracking based on sales
- **Benefit**: Real-time accuracy

## Migration for Existing Data

If you have existing sales data, run this to populate lookup table:

```sql
-- Populate lookup table from existing sales
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
ON DUPLICATE KEY UPDATE district_id = district_id;
```

## Common Issues & Solutions

### Issue: Lookup table has orphaned entries
**Solution**: Run cleanup script
```sql
DELETE dml FROM district_medicine_lookup dml
LEFT JOIN medicine_sales ms ON 
    dml.district_id = ms.district_id AND 
    dml.medicine_id = ms.medicine_id
WHERE ms.id IS NULL;
```

### Issue: Missing lookup entries
**Solution**: Re-run migration script above

### Issue: Duplicate entries (shouldn't happen due to unique index)
**Solution**: Check database constraints
```sql
SHOW INDEX FROM district_medicine_lookup;
-- Should have unique index on (district_id, medicine_id, formula_id)
```

## Performance Considerations

- **Index**: Unique index on `(district_id, medicine_id, formula_id)` ensures fast lookups
- **Overhead**: Minimal - one extra query per sales operation
- **Benefit**: Much faster forecast queries (no need to scan entire sales table)

## Rollback Plan

If issues occur, you can temporarily disable auto-management:

1. Comment out the `ensure_district_medicine_lookup()` calls
2. Comment out the `cleanup_district_medicine_lookup()` call
3. Manage lookup table manually or via separate script

But this is **not recommended** - the feature is designed to maintain data integrity.

## Support

For issues or questions:
1. Check logs for database errors
2. Verify unique constraint exists on lookup table
3. Check that medicine.formula_id is never NULL
4. Review activity logs for audit trail

## Documentation Files

- `DISTRICT_LOOKUP_AUTO_MANAGEMENT.md` - Detailed explanation
- `DISTRICT_LOOKUP_FLOW.md` - Visual flow diagrams
- `test_lookup_management.py` - Test script template
