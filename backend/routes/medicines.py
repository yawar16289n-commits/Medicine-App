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
            "existingId": existing.id
        }), 409
    
    new_medicine = Medicine(
        formula_id=data.get('formulaId'),
        brand_name=data.get('brandName'),
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
    Includes 14-day forecast.
    
    Returns:
        {
            "Formula A": [
                {
                    "id": 1,
                    "formulaId": 1,
                    "formulaName": "Formula A",
                    "brandName": "Brand X",
                    "dosageStrength": "500mg",
                    "createdAt": "2024-01-01T00:00:00",
                    "forecast14Days": 150
                }
            ]
        }
    """
    from datetime import datetime, timedelta
    from sqlalchemy import func
    
    medicines = Medicine.query.join(Formula).order_by(Formula.name.asc()).all()

    # Calculate 14-day forecast window
    today = date.today()
    forecast_end = today + timedelta(days=14)
    
    # Get all forecast data for the next 14 days summed across ALL districts
    # This sums forecasted_quantity across all districts and all dates in the 14-day window
    forecast_query = db.session.query(
        MedicineForecast.medicine_id,
        func.sum(MedicineForecast.forecasted_quantity).label('total_forecast')
    ).filter(
        MedicineForecast.forecast_date >= today,
        MedicineForecast.forecast_date < forecast_end
    ).group_by(MedicineForecast.medicine_id).all()
    
    # Create a dictionary of medicine_id -> total forecast (sum of all areas)
    forecast_map = {row[0]: row[1] for row in forecast_query}

    grouped = {}
    for med in medicines:
        formula_name = med.formula.name
        if formula_name not in grouped:
            grouped[formula_name] = []
        
        med_dict = med.to_dict()
        # Add individual medicine forecast
        med_dict['forecast14Days'] = forecast_map.get(med.id, 0)
        
        grouped[formula_name].append(med_dict)

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
                'brandName': brand_name
            }
        )
    
    return jsonify({"message": "Medicine deleted successfully"}), 200


@medicines_bp.route('/medicines/stats', methods=['GET'])
def get_medicine_stats():
    """
    Get medicine statistics optimized for dashboard.
    Much faster than fetching all medicines and calculating on frontend.
    
    Returns:
        {
            "total": 150,
            "lowStock": 20,
            "outOfStock": 5,
            "inStock": 125
        }
    """
    from datetime import datetime, timedelta
    from sqlalchemy import func
    
    try:
        # Get all medicines
        medicines = Medicine.query.all()
        total = len(medicines)
        
        if total == 0:
            return jsonify({
                "total": 0,
                "lowStock": 0,
                "outOfStock": 0,
                "inStock": 0
            }), 200
        
        # Calculate 14-day forecast window
        today = date.today()
        forecast_end = today + timedelta(days=14)
        
        # Get all forecast data for the next 14 days
        forecast_query = db.session.query(
            MedicineForecast.medicine_id,
            func.sum(MedicineForecast.forecasted_quantity).label('total_forecast')
        ).filter(
            MedicineForecast.forecast_date >= today,
            MedicineForecast.forecast_date < forecast_end
        ).group_by(MedicineForecast.medicine_id).all()
        
        forecast_map = {row[0]: row[1] for row in forecast_query}
        
        # Count medicines in each category
        out_of_stock = 0
        low_stock = 0
        in_stock = 0
        
        for medicine in medicines:
            stock = medicine.stock_level if medicine.stock_level is not None else 0
            forecast = forecast_map.get(medicine.id, 0)
            
            if stock == 0:
                out_of_stock += 1
            elif stock < forecast:
                # Low stock: current stock is less than 14-day forecast
                low_stock += 1
            else:
                in_stock += 1
        
        return jsonify({
            "total": total,
            "lowStock": low_stock,
            "outOfStock": out_of_stock,
            "inStock": in_stock
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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
            # This bulk upload expects basic medicine info
            # You may need to adjust based on actual CSV structure
            med = Medicine(
                formula_id=row.get('formulaid') or row.get('formula_id'),
                brand_name=row.get('brandname') or row.get('brand_name'),
                dosage_strength=row.get('dosagestrength') or row.get('dosage_strength'),
                stock_level=row.get('stocklevel') or row.get('stock_level', 0)
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


@medicines_bp.route('/medicines/sales', methods=['GET'])
def get_sales_records():
    """
    Get all sales records with medicine and district details
    Optional query params:
    - limit: number of records to return (default: all)
    - medicine_id: filter by medicine
    - district_id: filter by district
    - start_date: filter from date (YYYY-MM-DD)
    - end_date: filter to date (YYYY-MM-DD)
    """
    try:
        query = MedicineSales.query
        
        # Apply filters if provided
        medicine_id = request.args.get('medicine_id')
        if medicine_id:
            query = query.filter_by(medicine_id=int(medicine_id))
        
        district_id = request.args.get('district_id')
        if district_id:
            query = query.filter_by(district_id=int(district_id))
        
        start_date = request.args.get('start_date')
        if start_date:
            query = query.filter(MedicineSales.date >= start_date)
        
        end_date = request.args.get('end_date')
        if end_date:
            query = query.filter(MedicineSales.date <= end_date)
        
        # Order by date descending (most recent first)
        query = query.order_by(MedicineSales.date.desc())
        
        # Apply limit if provided
        limit = request.args.get('limit')
        if limit:
            query = query.limit(int(limit))
        
        sales_records = query.all()
        
        return jsonify([record.to_dict() for record in sales_records]), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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
            'Date': ['2026-01-05'],
            'Area': ['Bahadurabad'],
            'Formula': ['Paracetamol'],
            'Medicine Name/ID': ['Panadol'],
            'Dosage': ['500mg'],
            'Sale Quantity': ['100'],
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
    Expected columns: Date, Area, Formula, Medicine Name/ID, Dosage (optional), Sale Quantity
    Medicine Name/ID accepts either medicine ID or brand name
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
                # Get or create district (accept both 'area' and 'district')
                district_name = str(row.get('area', row.get('district', ''))).strip()
                if not district_name:
                    errors.append(f"Row {idx+2}: Missing area/district name")
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
                
                # Get medicine by name/ID and optional dosage
                medicine_identifier = str(row.get('medicine_name/id', row.get('medicine_name', row.get('medicine_brand', '')))).strip()
                dosage = str(row.get('dosage', '')).strip()
                
                if not medicine_identifier:
                    errors.append(f"Row {idx+2}: Missing medicine name/ID")
                    continue
                
                # Try to find medicine by brand name (medicine_id column removed)
                # First try exact match with formula and brand name
                query = Medicine.query.filter_by(
                    formula_id=formula.id,
                    brand_name=medicine_identifier
                )
                
                # If dosage specified, filter by it
                if dosage:
                    medicine = query.filter_by(dosage_strength=dosage).first()
                    if not medicine:
                        errors.append(f"Row {idx+2}: Medicine '{medicine_identifier}' with dosage '{dosage}' not found. Create it first in Manage Medicines.")
                        continue
                else:
                    # No dosage specified, use first available
                    medicine = query.first()
                    if not medicine:
                        errors.append(f"Row {idx+2}: Medicine '{medicine_identifier}' not found. Create it first in Manage Medicines.")
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
            'Medicine ID': ['1'],
            'Adjustment Type': ['ADD'],  # ADD or REDUCE
            'Quantity': ['100'],
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
    Expected columns: Medicine Name/ID, Adjustment Type (ADD/REDUCE), Quantity
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
        df.columns = [c.strip().lower().replace(' ', '_').replace('/', '_') for c in df.columns]
        
        records_processed = 0
        errors = []
        
        for idx, row in df.iterrows():
            try:
                # Get medicine ID (must be numeric)
                medicine_id_str = str(row.get('medicine_id', '')).strip()
                if not medicine_id_str:
                    errors.append(f"Row {idx+2}: Missing Medicine ID")
                    continue
                
                # Validate that it's a numeric ID
                if not medicine_id_str.isdigit():
                    errors.append(f"Row {idx+2}: Medicine ID must be numeric (e.g., 1, 2, 3), got '{medicine_id_str}'")
                    continue
                
                medicine_id = int(medicine_id_str)
                medicine = Medicine.query.get(medicine_id)
                
                if not medicine:
                    errors.append(f"Row {idx+2}: Medicine with ID {medicine_id} not found")
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

