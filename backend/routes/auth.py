from flask import Blueprint, jsonify, request
from models import User
from database import db

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    if not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({
            'success': False,
            'error': 'Name, email, and password are required'
        }), 400

    email_exists = User.query.filter_by(email=data['email']).first()

    if email_exists:
        return jsonify({
            'success': False,
            'error': 'Email already registered'
        }), 409

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
    data = request.get_json()
    if not data.get('email') or not data.get('password'):
        return jsonify({
            'success': False,
            'error': 'Email and password are required'
        }), 400
    
    user = User.query.filter_by(email=data['email']).first()
    if not user or user.password != data['password']:
        return jsonify({
            'success': False,
            'error': 'Invalid email or password'
        }), 401

    return jsonify({
        'success': True,
        'message': 'Login successful',
        'user': user.to_dict()
    }), 200


@auth_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
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