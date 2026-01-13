# District Medicine Lookup - Flow Diagram

## Sales CREATE/UPDATE Flow
```
┌─────────────────────────────────────────────────────────────┐
│  POST /api/medicines/sales                                  │
│  POST /api/medicines/sales/upload                           │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Validate Input      │
         │  - Medicine exists   │
         │  - District exists   │
         │  - Stock available   │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Create/Update       │
         │  MedicineSales       │
         │  - Adjust stock      │
         └──────────┬───────────┘
                    │
                    ▼
    ┌───────────────────────────────────┐
    │  ensure_district_medicine_lookup  │
    │  (district_id, medicine_id,       │
    │   formula_id)                     │
    └───────────┬───────────────────────┘
                │
                ▼
    ┌───────────────────────────────────┐
    │  Check if entry exists in         │
    │  district_medicine_lookup         │
    └───────────┬───────────────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
    ┌────────┐      ┌────────┐
    │ EXISTS │      │NOT EXIST│
    │ ═════> │      │  ═════> │
    │IGNORE  │      │ CREATE  │
    │        │      │  ENTRY  │
    └────────┘      └────────┘
                        │
                        ▼
                ┌───────────────┐
                │ INSERT into   │
                │ lookup table  │
                └───────────────┘
```

## Sales DELETE Flow
```
┌─────────────────────────────────────────────────────────────┐
│  DELETE /api/medicines/sales/<id>                           │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Find Sales Record   │
         │  by ID               │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Store Info          │
         │  - district_id       │
         │  - medicine_id       │
         │  - formula_id        │
         │  - quantity          │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Restore Stock       │
         │  medicine.stock_level│
         │  += quantity         │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Delete              │
         │  MedicineSales       │
         └──────────┬───────────┘
                    │
                    ▼
    ┌───────────────────────────────────┐
    │  cleanup_district_medicine_lookup │
    │  (district_id, medicine_id,       │
    │   formula_id)                     │
    └───────────┬───────────────────────┘
                │
                ▼
    ┌───────────────────────────────────┐
    │  Check if OTHER sales exist       │
    │  for this district-medicine combo │
    └───────────┬───────────────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
    ┌────────┐      ┌────────┐
    │ OTHER  │      │   NO   │
    │ SALES  │      │ OTHER  │
    │ EXIST  │      │ SALES  │
    │ ═════> │      │ ═════> │
    │ KEEP   │      │ DELETE │
    │ ENTRY  │      │ ENTRY  │
    └────────┘      └────┬───┘
                         │
                         ▼
                ┌─────────────────┐
                │ DELETE from     │
                │ lookup table    │
                └─────────────────┘
```

## Key Decision Points

### When Adding/Updating Sales
**Question:** Does (district, medicine, formula) exist in lookup?
- **YES** → Do nothing (already tracked)
- **NO** → Add new entry (new combination discovered)

### When Deleting Sales
**Question:** Are there other sales for this (district, medicine) combination?
- **YES** → Keep lookup entry (still has sales data)
- **NO** → Remove lookup entry (no longer relevant)

## Database State Example

### Initial State
```
medicine_sales:
(empty)

district_medicine_lookup:
(empty)
```

### After First Sale
```sql
-- Sale: Medicine=1, District=1, Formula=1, Qty=50
```
```
medicine_sales:
ID | medicine_id | district_id | quantity
1  | 1           | 1           | 50

district_medicine_lookup:
ID | district_id | medicine_id | formula_id
1  | 1           | 1           | 1
```

### After Second Sale (same combo)
```sql
-- Sale: Medicine=1, District=1, Formula=1, Qty=30 (different date)
```
```
medicine_sales:
ID | medicine_id | district_id | quantity
1  | 1           | 1           | 50
2  | 1           | 1           | 30

district_medicine_lookup:
ID | district_id | medicine_id | formula_id
1  | 1           | 1           | 1
   ↑ No duplicate - already exists!
```

### After Deleting First Sale
```sql
DELETE FROM medicine_sales WHERE id = 1;
```
```
medicine_sales:
ID | medicine_id | district_id | quantity
2  | 1           | 1           | 30
   ↑ Still exists!

district_medicine_lookup:
ID | district_id | medicine_id | formula_id
1  | 1           | 1           | 1
   ↑ Kept - because sale #2 still exists
```

### After Deleting Last Sale
```sql
DELETE FROM medicine_sales WHERE id = 2;
```
```
medicine_sales:
(empty)
   ↑ No more sales for this combo!

district_medicine_lookup:
(empty)
   ↑ Removed - no sales left for this combo
```

## Benefits Visualization

```
┌──────────────────────────────────────────────────────────┐
│                 BEFORE (Manual)                          │
├──────────────────────────────────────────────────────────┤
│  1. Admin adds sales data                                │
│  2. Admin must remember to update lookup table           │
│  3. Risk of forgetting or errors                         │
│  4. Lookup table becomes stale over time                 │
│  5. Forecasts may use outdated district-medicine list    │
└──────────────────────────────────────────────────────────┘
                            ⬇
┌──────────────────────────────────────────────────────────┐
│                 AFTER (Automatic)                        │
├──────────────────────────────────────────────────────────┤
│  1. Admin adds sales data                                │
│  2. ✓ Lookup table automatically updated                 │
│  3. ✓ No manual intervention needed                      │
│  4. ✓ Lookup table always reflects current sales        │
│  5. ✓ Forecasts always use accurate district-medicine   │
│     combinations                                         │
└──────────────────────────────────────────────────────────┘
```
