"""Authentication routes - login and registration"""
from flask import Blueprint, request, jsonify
from database import db
from models import User
from middleware.auth import generate_token
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

# Simple in-memory rate limiting (for production, use Redis or similar)
login_attempts = {}

def check_rate_limit(username):
    """Check if user has exceeded login attempts"""
    now = datetime.utcnow()
    if username in login_attempts:
        attempts, last_attempt = login_attempts[username]
        # Reset if last attempt was more than 15 minutes ago
        if now - last_attempt > timedelta(minutes=15):
            login_attempts[username] = (1, now)
            return True
        # Block if more than 5 attempts in 15 minutes
        if attempts >= 5:
            return False
        login_attempts[username] = (attempts + 1, now)
    else:
        login_attempts[username] = (1, now)
    return True


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    # Check rate limiting
    if not check_rate_limit(username):
        return jsonify({"error": "too many login attempts, please try again later"}), 429

    # Look up user in database
    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "invalid credentials"}), 401

    # Reset login attempts on successful login
    if username in login_attempts:
        del login_attempts[username]

    # Generate JWT token
    token = generate_token(username, user.role)

    return jsonify({
        "token": token,
        "username": username,
        "role": user.role
    }), 200


@auth_bp.route('/register', methods=['POST'])
def register():

    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'data_operator')

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    # Check if user already exists
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "username already exists"}), 400

    # Validate role
    valid_roles = ['admin', 'analyst', 'data_operator']
    if role not in valid_roles:
        return jsonify({
            "error": f"role must be one of: {', '.join(valid_roles)}"
        }), 400

    # Create new user
    user = User(username=username, role=role)
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "user created successfully",
        "user": user.to_dict()
    }), 201
