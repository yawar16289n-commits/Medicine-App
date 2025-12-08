"""
Authentication Routes - signup, login endpoints
"""
from flask import Blueprint, jsonify, request
from models import User
from database import db

# Create blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    User signup/registration
    Expects JSON: { name, email, password, role }
    """
    data = request.get_json()

    # Validate required fields
    if not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({
            'success': False,
            'error': 'Name, email, and password are required'
        }), 400

    # Check if email already exists
    email_exists = User.query.filter_by(email=data['email']).first()

    if email_exists:
        return jsonify({
            'success': False,
            'error': 'Email already registered'
        }), 409

    # Create new user
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=data['password'],  
        role=data.get('role')
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'User registered successfully',
        'user': new_user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User login
    Expects JSON: { email, password }
    """
    data = request.get_json()

    # Validate required fields
    if not data.get('email') or not data.get('password'):
        return jsonify({
            'success': False,
            'error': 'Email and password are required'
        }), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()

    # Check if user exists and password matches
    if not user or user.password != data['password']:
        return jsonify({
            'success': False,
            'error': 'Invalid email or password'
        }), 401

    return jsonify({
        'success': True,
        'message': 'Login successful',
        'user': user.role
    }), 200


@auth_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """
    Get user details by ID (public profile)
    """
    user = User.query.get(user_id)

    if not user:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    return jsonify({
        'success': True,
        'user': user.to_dict()
    }), 200