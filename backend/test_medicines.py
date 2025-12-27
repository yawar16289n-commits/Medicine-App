from models import Medicine, Formula, District
from import_data_only import app

app.app_context().push()

meds = Medicine.query.all()
print(f'Found {len(meds)} medicines')
for m in meds:
    print(f'  - {m.brand_name} ({m.medicine_id}) - Formula: {m.formula.name}')
