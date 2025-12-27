"""Medicine management routes - CRUD operations and file upload"""
from flask import Blueprint, request, jsonify, g
from database import db
from models import Medicine, Formula, District, MedicineSales, MedicineForecast
from datetime import date
import pandas as pd
from utils.activity_logger import log_activity
from middleware.auth import require_auth

medicines_bp = Blueprint('medicines', __name__)


@medicines_bp.route('/medicines', methods=['POST'])
@require_auth
def create_medicine(**kwargs):
    """
    Create a new medicine (master record without district)
    Expected JSON:
    {
        "formulaId": int,
        "brandName": str,
        "dosageStrength": str (optional)
    }
    District will be assigned when sales data is uploaded.
    Medicine ID is auto-generated.
    """
    g.current_user = kwargs.get('current_user')
    data = request.get_json()
    
    # Validate required fields
    if not data.get('brandName'):
        return jsonify({"error": "Brand name is required"}), 400
    
    # Validate formula exists
    formula = Formula.query.get(data.get('formulaId'))
    if not formula:
        return jsonify({"error": "Formula not found"}), 404
    
    # Check if medicine with same formula, brand, and dosage already exists
    existing = Medicine.query.filter_by(
        formula_id=data.get('formulaId'),
        brand_name=data.get('brandName'),
        dosage_strength=data.get('dosageStrength')
    ).first()
    
    if existing:
        return jsonify({
            "error": f"Medicine already exists: {existing.brand_name} {existing.dosage_strength or ''} ({formula.name})",
            "existingMedicineId": existing.medicine_id
        }), 409
    
    # Auto-generate medicine_id
    # Query for the highest medicine_id number
    last_medicine = Medicine.query.order_by(Medicine.id.desc()).first()
    if last_medicine and last_medicine.medicine_id and last_medicine.medicine_id.startswith('MED'):
        try:
            last_num = int(last_medicine.medicine_id[3:])
            new_num = last_num + 1
        except (ValueError, IndexError):
            new_num = 1
    else:
        new_num = 1
    
    medicine_id = f"MED{new_num:03d}"  # Format: MED001, MED002, etc.
    
    new_medicine = Medicine(
        formula_id=data.get('formulaId'),
        brand_name=data.get('brandName'),
        medicine_id=medicine_id,
        dosage_strength=data.get('dosageStrength'),
        therapeutic_class=data.get('therapeuticClass')  # Accept from request
    )
    db.session.add(new_medicine)
    db.session.commit()
    
    # Log activity
    user = getattr(g, 'current_user', None)
    if user:
        log_activity(
            user_id=user.id,
            user_name=user.username,
            action_type='create',
            entity_type='medicine',
            entity_id=new_medicine.id,
            details={
                'medicineId': medicine_id,
                'brandName': new_medicine.brand_name,
                'dosage': new_medicine.dosage_strength
            }
        )
    
    return jsonify({
        "message": "Medicine added successfully",
        "medicine": new_medicine.to_dict()
    }), 201


@medicines_bp.route('/medicines', methods=['GET'])
def get_medicines():
    """
    Get all medicines grouped by formula name.
    
    Returns:
        {
            "Formula A": [
                {
                    "id": 1,
                    "formulaId": 1,
                    "formulaName": "Formula A",
                    "brandName": "Brand X",
                    "medicineId": "MED001",
                    "dosageStrength": "500mg",
                    "createdAt": "2024-01-01T00:00:00"
                }
            ]
        }
    """
    medicines = Medicine.query.join(Formula).order_by(Formula.name.asc()).all()

    grouped = {}
    for med in medicines:
        formula_name = med.formula.name
        if formula_name not in grouped:
            grouped[formula_name] = []
        grouped[formula_name].append(med.to_dict())

    return jsonify(grouped), 200


@medicines_bp.route('/medicines/<int:id>', methods=['GET'])
def get_medicine(id):
    """Get a specific medicine by ID"""
    medicine = Medicine.query.get_or_404(id)
    return jsonify(medicine.to_dict()), 200


@medicines_bp.route('/medicines/<int:id>', methods=['PUT'])
@require_auth
def update_medicine(id, **kwargs):
    """
    Update medicine details.
    
    Request body (all fields optional):
        {
            "formulaId": 1,
            "brandName": "Updated Brand",
            "medicineId": "MED001",
            "dosageStrength": "500mg"
        }
    """
    g.current_user = kwargs.get('current_user')
    medicine = Medicine.query.get_or_404(id)
    data = request.get_json()

    # Validate formula if being updated
    if 'formulaId' in data:
        formula = Formula.query.get(data['formulaId'])
        if not formula:
            return jsonify({"error": "Formula not found"}), 404
        medicine.formula_id = data['formulaId']
    
    if 'brandName' in data:
        medicine.brand_name = data['brandName']
    if 'medicineId' in data:
        medicine.medicine_id = data['medicineId']
    if 'dosageStrength' in data:
        medicine.dosage_strength = data['dosageStrength']
    if 'therapeuticClass' in data:
        medicine.therapeutic_class = data['therapeuticClass']

    db.session.commit()
    
    # Log activity
    user = getattr(g, 'current_user', None)
    if user:
        log_activity(
            user_id=user.id,
            user_name=user.username,
            action_type='update',
            entity_type='medicine',
            entity_id=medicine.id,
            details={
                'medicineId': medicine.medicine_id,
                'brandName': medicine.brand_name
            }
        )
    
    return jsonify({
        "message": "Medicine updated successfully",
        "medicine": medicine.to_dict()
    }), 200


@medicines_bp.route('/medicines/<int:id>', methods=['DELETE'])
@require_auth
def delete_medicine(id, **kwargs):
    """Delete a medicine by ID"""
    g.current_user = kwargs.get('current_user')
    medicine = Medicine.query.get_or_404(id)
    
    # Store details before deletion
    medicine_id = medicine.medicine_id
    brand_name = medicine.brand_name
    
    db.session.delete(medicine)
    db.session.commit()
    
    # Log activity
    user = getattr(g, 'current_user', None)
    if user:
        log_activity(
            user_id=user.id,
            user_name=user.username,
            action_type='delete',
            entity_type='medicine',
            entity_id=id,
            details={
                'medicineId': medicine_id,
                'brandName': brand_name
            }
        )
    
    return jsonify({"message": "Medicine deleted successfully"}), 200


@medicines_bp.route('/medicines/upload', methods=['POST'])
def upload_medicines():

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Detect CSV or Excel
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file)
        else:
            return jsonify({
                'error': 'Unsupported file format. Use CSV or Excel.'
            }), 400

        # Normalize column names
        df.columns = [c.strip().lower() for c in df.columns]

        count = 0
        for _, row in df.iterrows():
            med = Medicine(
                formula=row.get('formula'),
                medicine_id=row.get('medicineid') or row.get('medicine_id'),
                name=row.get('name'),
                stock=row.get('stock', 0),
                forecast=row.get('forecast', 0),
                stock_status=row.get('stockstatus') or row.get('stock_status', 'Unknown')
            )
            db.session.add(med)
            count += 1

        db.session.commit()
        return jsonify({
            'message': f'{count} medicines inserted successfully'
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@medicines_bp.route('/medicines/sales', methods=['POST'])
@require_auth
def create_sales_record(**kwargs):
    """
    Create a new sales record (manual entry from form)
    Expected JSON:
    {
        "medicineId": int,
        "districtId": int,
        "date": "YYYY-MM-DD",
        "saleQuantity": int
    }
    """
    # Store user in g for activity logging
    g.current_user = kwargs.get('current_user')
    
    data = request.get_json()
    
    # Validate required fields
    if not data.get('medicineId') or not data.get('districtId'):
        return jsonify({"error": "Medicine and district are required"}), 400
    
    # Get medicine and district
    medicine = Medicine.query.get(data.get('medicineId'))
    if not medicine:
        return jsonify({"error": "Medicine not found"}), 404
    
    district = District.query.get(data.get('districtId'))
    if not district:
        return jsonify({"error": "District not found"}), 404
    
    # Parse date
    try:
        sale_date = date.fromisoformat(data.get('date', date.today().isoformat()))
    except:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    # Get sale quantity
    try:
        sale_quantity = int(data.get('saleQuantity', 0))
    except:
        return jsonify({"error": "Invalid sale quantity"}), 400
    
    if sale_quantity <= 0:
        return jsonify({"error": "Sale quantity must be greater than 0"}), 400
    
    # Check if sales record exists for this medicine/district/date
    sales_record = MedicineSales.query.filter_by(
        medicine_id=medicine.id,
        district_id=district.id,
        date=sale_date
    ).first()
    
    is_update = sales_record is not None
    
    # For updates, restore previous quantity before checking stock
    if is_update:
        medicine.stock_level += sales_record.quantity
    
    # Check stock availability
    if medicine.stock_level < sale_quantity:
        # Restore original state if validation fails
        if is_update:
            medicine.stock_level -= sales_record.quantity
        return jsonify({
            "error": f"Insufficient stock. Available: {medicine.stock_level}, Required: {sale_quantity}"
        }), 400
    
    if sales_record:
        # Update sales record (stock already restored above)
        sales_record.quantity = sale_quantity
        # Deduct new quantity from stock
        medicine.stock_level -= sale_quantity
        message = "Sales record updated successfully"
    else:
        # Create new sales record and reduce stock
        sales_record = MedicineSales(
            medicine_id=medicine.id,
            district_id=district.id,
            date=sale_date,
            quantity=sale_quantity
        )
        db.session.add(sales_record)
        medicine.stock_level -= sale_quantity
        message = "Sales record created successfully"
    
    db.session.commit()
    
    # Log activity
    user = getattr(g, 'current_user', None)
    if user:
        action = 'update' if is_update else 'create'
        log_activity(
            user_id=user.id,
            user_name=user.username,
            action_type=action,
            entity_type='sales_record',
            entity_id=sales_record.id,
            details={
                'medicine': medicine.brand_name,
                'medicineId': medicine.medicine_id,
                'district': district.name,
                'date': sale_date.isoformat(),
                'quantity': sale_quantity
            }
        )
    
    return jsonify({
        "message": message,
        "medicine": medicine.to_dict(),
        "salesRecord": {
            "id": sales_record.id,
            "medicineId": sales_record.medicine_id,
            "districtId": sales_record.district_id,
            "date": sales_record.date.isoformat(),
            "quantity": sales_record.quantity
        }
    }), 201


@medicines_bp.route('/medicines/sales/template', methods=['GET'])
def download_sales_template():
    """
    Download Excel template for sales data upload with column headers
    """
    from io import BytesIO
    from flask import send_file
    
    try:
        # Create template with column headers matching manual entry fields
        template_data = {
            'District': [''],
            'Formula': [''],
            'Medicine Brand': [''],
            'Dosage': [''],
            'Date': [''],
            'Sale Quantity': [''],
        }
        
        df = pd.DataFrame(template_data)
        
        # Create Excel file in memory
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Sales Data')
            
            # Get worksheet and format headers
            worksheet = writer.sheets['Sales Data']
            for col in worksheet.columns:
                max_length = max(len(str(cell.value)) for cell in col)
                worksheet.column_dimensions[col[0].column_letter].width = max_length + 2
        
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name='sales_data_template.xlsx'
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@medicines_bp.route('/medicines/sales/upload', methods=['POST'])
@require_auth
def upload_sales_data(**kwargs):
    """
    Upload sales data from Excel/CSV file
    Expected columns: District, Formula, Medicine Brand, Dosage (optional), Date, Sale Quantity
    Matches the manual entry fields
    """
    g.current_user = kwargs.get('current_user')
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        # Read file
        file_ext = file.filename.rsplit('.', 1)[1].lower()
        if file_ext == 'csv':
            df = pd.read_csv(file)
        elif file_ext in ['xlsx', 'xls']:
            df = pd.read_excel(file)
        else:
            return jsonify({'error': 'Unsupported file format. Use CSV or Excel.'}), 400
        
        # Normalize column names
        df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]
        
        records_processed = 0
        errors = []
        
        for idx, row in df.iterrows():
            try:
                # Get or create district
                district_name = str(row.get('district', '')).strip()
                if not district_name:
                    errors.append(f"Row {idx+2}: Missing district name")
                    continue
                
                district = District.query.filter_by(name=district_name).first()
                if not district:
                    district = District(name=district_name)
                    db.session.add(district)
                    db.session.flush()
                
                # Get or create formula
                formula_name = str(row.get('formula', '')).strip()
                if not formula_name:
                    errors.append(f"Row {idx+2}: Missing formula name")
                    continue
                
                formula = Formula.query.filter_by(name=formula_name).first()
                if not formula:
                    errors.append(f"Row {idx+2}: Formula '{formula_name}' does not exist. Create it first in Manage Formulas.")
                    continue
                
                # Get medicine by brand and optional dosage
                brand_name = str(row.get('medicine_brand', '')).strip()
                dosage = str(row.get('dosage', '')).strip()
                
                if not brand_name:
                    errors.append(f"Row {idx+2}: Missing medicine brand")
                    continue
                
                # Query medicine by formula and brand
                query = Medicine.query.filter_by(
                    formula_id=formula.id,
                    brand_name=brand_name
                )
                
                # If dosage specified, filter by it
                if dosage:
                    medicine = query.filter_by(dosage_strength=dosage).first()
                    if not medicine:
                        errors.append(f"Row {idx+2}: Medicine '{brand_name}' with dosage '{dosage}' not found. Create it first in Manage Medicines.")
                        continue
                else:
                    # No dosage specified, use first available
                    medicine = query.first()
                    if not medicine:
                        errors.append(f"Row {idx+2}: Medicine '{brand_name}' not found. Create it first in Manage Medicines.")
                        continue
                
                # Get date
                sale_date = row.get('date')
                if pd.isna(sale_date) or not sale_date:
                    sale_date = date.today()
                else:
                    try:
                        sale_date = pd.to_datetime(sale_date).date()
                    except:
                        errors.append(f"Row {idx+2}: Invalid date format")
                        continue
                
                # Get sale quantity
                sale_quantity = row.get('sale_quantity', 0)
                try:
                    sale_quantity = int(float(sale_quantity)) if sale_quantity else 0
                except:
                    sale_quantity = 0
                
                if sale_quantity <= 0:
                    errors.append(f"Row {idx+2}: Invalid sale quantity")
                    continue
                
                # Check stock availability
                if medicine.stock_level < sale_quantity:
                    errors.append(f"Row {idx+2}: Insufficient stock. Available: {medicine.stock_level}, Required: {sale_quantity}")
                    continue
                
                # Check if sales record exists for this medicine/district/date
                sales_record = MedicineSales.query.filter_by(
                    medicine_id=medicine.id,
                    district_id=district.id,
                    date=sale_date
                ).first()
                
                if sales_record:
                    # Restore previous quantity to stock before updating
                    medicine.stock_level += sales_record.quantity
                    # Update sales record
                    sales_record.quantity = sale_quantity
                    # Deduct new quantity from stock
                    medicine.stock_level -= sale_quantity
                else:
                    # Create new sales record and reduce stock
                    sales_record = MedicineSales(
                        medicine_id=medicine.id,
                        district_id=district.id,
                        date=sale_date,
                        quantity=sale_quantity
                    )
                    db.session.add(sales_record)
                    medicine.stock_level -= sale_quantity
                
                records_processed += 1
                
            except Exception as e:
                errors.append(f"Row {idx+2}: {str(e)}")
                continue
        
        db.session.commit()
        
        # Log activity
        user = getattr(g, 'current_user', None)
        if user:
            log_activity(
                user_id=user.id,
                user_name=user.username,
                action_type='upload',
                entity_type='sales_records',
                details={
                    'records_processed': records_processed,
                    'total_errors': len(errors)
                }
            )
        
        response = {
            'success': True,
            'message': f'Upload complete: {records_processed} sales records processed',
            'records_processed': records_processed
        }
        
        if errors:
            response['errors'] = errors[:10]  # Limit to first 10 errors
            response['total_errors'] = len(errors)
        
        return jsonify(response), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@medicines_bp.route('/medicines/stock/template', methods=['GET'])
def download_stock_template():
    """
    Download Excel template for stock adjustments
    """
    from io import BytesIO
    from flask import send_file
    
    try:
        # Create template with column headers
        template_data = {
            'Medicine ID': ['MED001'],
            'Adjustment Type': ['ADD'],  # ADD or REDUCE
            'Quantity': ['100'],
            'Reason': ['New Stock Arrival'],
        }
        
        df = pd.DataFrame(template_data)
        
        # Create Excel file in memory
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Stock Adjustments')
            
            # Get worksheet and format headers
            worksheet = writer.sheets['Stock Adjustments']
            for col in worksheet.columns:
                max_length = max(len(str(cell.value)) for cell in col)
                worksheet.column_dimensions[col[0].column_letter].width = max_length + 2
        
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name='stock_adjustments_template.xlsx'
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@medicines_bp.route('/medicines/stock/upload', methods=['POST'])
@require_auth
def upload_stock_adjustments(**kwargs):
    """
    Upload stock adjustments from Excel/CSV file
    Expected columns: Medicine ID, Adjustment Type (ADD/REDUCE), Quantity, Reason
    """
    g.current_user = kwargs.get('current_user')
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        # Read file
        file_ext = file.filename.rsplit('.', 1)[1].lower()
        if file_ext == 'csv':
            df = pd.read_csv(file)
        elif file_ext in ['xlsx', 'xls']:
            df = pd.read_excel(file)
        else:
            return jsonify({'error': 'Unsupported file format. Use CSV or Excel.'}), 400
        
        # Normalize column names
        df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]
        
        records_processed = 0
        errors = []
        
        for idx, row in df.iterrows():
            try:
                # Get medicine by medicine_id
                medicine_id = str(row.get('medicine_id', '')).strip()
                if not medicine_id:
                    errors.append(f"Row {idx+2}: Missing medicine ID")
                    continue
                
                medicine = Medicine.query.filter_by(medicine_id=medicine_id).first()
                if not medicine:
                    errors.append(f"Row {idx+2}: Medicine '{medicine_id}' not found")
                    continue
                
                # Get adjustment type
                adjustment_type = str(row.get('adjustment_type', '')).strip().upper()
                if adjustment_type not in ['ADD', 'REDUCE']:
                    errors.append(f"Row {idx+2}: Invalid adjustment type. Use 'ADD' or 'REDUCE'")
                    continue
                
                # Get quantity
                quantity = row.get('quantity', 0)
                try:
                    quantity = int(float(quantity)) if quantity else 0
                except:
                    quantity = 0
                
                if quantity <= 0:
                    errors.append(f"Row {idx+2}: Invalid quantity")
                    continue
                
                # Apply adjustment
                if adjustment_type == 'ADD':
                    medicine.stock_level += quantity
                else:  # REDUCE
                    if medicine.stock_level < quantity:
                        errors.append(f"Row {idx+2}: Cannot reduce {quantity} units. Available stock: {medicine.stock_level}")
                        continue
                    medicine.stock_level -= quantity
                
                records_processed += 1
                
            except Exception as e:
                errors.append(f"Row {idx+2}: {str(e)}")
                continue
        
        db.session.commit()
        
        # Log activity
        user = getattr(g, 'current_user', None)
        if user:
            log_activity(
                user_id=user.id,
                user_name=user.username,
                action_type='upload',
                entity_type='stock_adjustments',
                details={
                    'records_processed': records_processed,
                    'total_errors': len(errors)
                }
            )
        
        response = {
            'success': True,
            'message': f'Stock adjustments complete: {records_processed} records processed',
            'records_processed': records_processed
        }
        
        if errors:
            response['errors'] = errors[:10]  # Limit to first 10 errors
            response['total_errors'] = len(errors)
        
        return jsonify(response), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

