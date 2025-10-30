from flask import Blueprint, request, jsonify, current_app
from database import db
from models import Medicine, User
import pandas as pd
import io
import os
import jwt
import datetime

# Secret for JWTs - can be overridden via env var JWT_SECRET
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")

bp = Blueprint('api', __name__, url_prefix='/api')


# ----------------------------
# 🔐 Database-based Login (JWT)
# ----------------------------
@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    # Look up user in database
    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "invalid credentials"}), 401

    payload = {
        "sub": username,
        "role": user.role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')

    return jsonify({"token": token, "username": username, "role": user.role}), 200


# ----------------------------
# 👤 User Registration (Optional)
# ----------------------------
@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'user')  # default to 'user' role

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    # Check if user already exists
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "username already exists"}), 400

    # Validate role
    if role not in ['user', 'admin']:
        return jsonify({"error": "role must be 'user' or 'admin'"}), 400

    # Create new user
    user = User(username=username, role=role)
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "user created successfully", "user": user.to_dict()}), 201


# ----------------------------
# 👥 User Management (Admin Only)
# ----------------------------
def require_admin():
    """Decorator to require admin role for endpoints"""
    from functools import wraps
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get token from Authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({"error": "token required"}), 401
            
            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
                if payload.get('role') != 'admin':
                    return jsonify({"error": "admin access required"}), 403
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "token expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "invalid token"}), 401
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@bp.route('/users', methods=['GET'])
@require_admin()
def get_all_users():
    """Get all users (admin only)"""
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([user.to_dict() for user in users]), 200

@bp.route('/users/<int:user_id>', methods=['GET'])
@require_admin()
def get_user(user_id):
    """Get specific user (admin only)"""
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200

@bp.route('/users/<int:user_id>', methods=['PUT'])
@require_admin()
def update_user(user_id):
    """Update user (admin only)"""
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    
    # Update username if provided
    if 'username' in data:
        # Check if username already exists (excluding current user)
        existing = User.query.filter(User.username == data['username'], User.id != user_id).first()
        if existing:
            return jsonify({"error": "username already exists"}), 400
        user.username = data['username']
    
    # Update role if provided
    if 'role' in data:
        if data['role'] not in ['user', 'admin']:
            return jsonify({"error": "role must be 'user' or 'admin'"}), 400
        user.role = data['role']
    
    # Update password if provided
    if 'password' in data and data['password']:
        user.set_password(data['password'])
    
    db.session.commit()
    return jsonify({"message": "user updated successfully", "user": user.to_dict()}), 200

@bp.route('/users/<int:user_id>', methods=['DELETE'])
@require_admin()
def delete_user(user_id):
    """Delete user (admin only)"""
    user = User.query.get_or_404(user_id)
    
    # Prevent deleting yourself
    auth_header = request.headers.get('Authorization')
    token = auth_header.split(' ')[1]
    payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    if payload.get('sub') == user.username:
        return jsonify({"error": "cannot delete your own account"}), 400
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "user deleted successfully"}), 200

# ----------------------------
# 👤 User Profile Management
# ----------------------------
def get_current_user():
    """Get current user from JWT token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, "token required"
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        username = payload.get('sub')
        user = User.query.filter_by(username=username).first()
        return user, None
    except jwt.ExpiredSignatureError:
        return None, "token expired"
    except jwt.InvalidTokenError:
        return None, "invalid token"
    except Exception:
        return None, "authentication error"

@bp.route('/profile', methods=['GET'])
def get_profile():
    """Get current user's profile"""
    user, error = get_current_user()
    if not user:
        return jsonify({"error": error or "authentication required"}), 401
    
    return jsonify(user.to_dict()), 200

@bp.route('/profile', methods=['PUT'])
def update_profile():
    """Update current user's profile"""
    user, error = get_current_user()
    if not user:
        return jsonify({"error": error or "authentication required"}), 401
    
    data = request.get_json() or {}
    username_changed = False
    
    # Update username if provided
    if 'username' in data and data['username'] != user.username:
        # Check if username already exists (excluding current user)
        existing = User.query.filter(User.username == data['username'], User.id != user.id).first()
        if existing:
            return jsonify({"error": "username already exists"}), 400
        user.username = data['username']
        username_changed = True
    
    # Update password if provided
    if 'password' in data and data['password']:
        user.set_password(data['password'])
    
    # Note: users cannot change their own role
    
    db.session.commit()
    
    # If username changed, issue a new token
    response_data = {"message": "profile updated successfully", "user": user.to_dict()}
    if username_changed:
        payload = {
            "sub": user.username,
            "role": user.role,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)
        }
        new_token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
        response_data["token"] = new_token
    
    return jsonify(response_data), 200


# ----------------------------
# ➕ Add Medicine
# ----------------------------
@bp.route('/medicines', methods=['POST'])
def create_medicine():
    data = request.get_json()
    new_medicine = Medicine(
        formula=data.get('formula'),
        medicine_id=data.get('medicineId'),
        name=data.get('name'),
        stock=data.get('stock'),
        forecast=data.get('forecast'),
        stock_status=data.get('stockStatus')
    )
    db.session.add(new_medicine)
    db.session.commit()
    return jsonify({"message": "Medicine added successfully", "medicine": new_medicine.to_dict()}), 201


# ----------------------------
# 📋 Get All Medicines (Grouped by Formula)
# ----------------------------
@bp.route('/medicines', methods=['GET'])
def get_medicines():
    medicines = Medicine.query.order_by(Medicine.formula.asc()).all()

    grouped = {}
    for med in medicines:
        if med.formula not in grouped:
            grouped[med.formula] = []
        grouped[med.formula].append(med.to_dict())

    return jsonify(grouped), 200


# ----------------------------
# ✏️ Update Medicine
# ----------------------------
@bp.route('/medicines/<int:id>', methods=['PUT'])
def update_medicine(id):
    medicine = Medicine.query.get_or_404(id)
    data = request.get_json()

    medicine.formula = data.get('formula', medicine.formula)
    medicine.medicine_id = data.get('medicineId', medicine.medicine_id)
    medicine.name = data.get('name', medicine.name)
    medicine.stock = data.get('stock', medicine.stock)
    medicine.forecast = data.get('forecast', medicine.forecast)
    medicine.stock_status = data.get('stockStatus', medicine.stock_status)

    db.session.commit()
    return jsonify({"message": "Medicine updated successfully", "medicine": medicine.to_dict()}), 200


# ----------------------------
# ❌ Delete Medicine
# ----------------------------
@bp.route('/medicines/<int:id>', methods=['DELETE'])
def delete_medicine(id):
    medicine = Medicine.query.get_or_404(id)
    db.session.delete(medicine)
    db.session.commit()
    return jsonify({"message": "Medicine deleted successfully"}), 200



# ----------------------------
# 📤 Upload Medicines (CSV or Excel)
# ----------------------------
@bp.route('/medicines/upload', methods=['POST'])
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
            return jsonify({'error': 'Unsupported file format. Use CSV or Excel.'}), 400

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
        return jsonify({'message': f'{count} medicines inserted successfully'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500