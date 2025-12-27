"""User management routes - CRUD operations and profile management"""
from flask import Blueprint, request, jsonify
from database import db
from models import User
from middleware.auth import require_role, require_auth, get_current_user, generate_token
import jwt
import os

users_bp = Blueprint('users', __name__)
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")


# ----------------------------
# Admin User Management
# ----------------------------

@users_bp.route('/users', methods=['GET'])
@require_role('admin')
def get_all_users(**kwargs):
    """Get all users (admin only)"""
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([user.to_dict() for user in users]), 200


@users_bp.route('/users/<int:user_id>', methods=['GET'])
@require_role('admin')
def get_user(user_id, **kwargs):
    """Get specific user by ID (admin only)"""
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200


@users_bp.route('/users/<int:user_id>', methods=['PUT'])
@require_role('admin')
def update_user(user_id, **kwargs):

    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    
    # Update username if provided
    if 'username' in data:
        # Check if username already exists (excluding current user)
        existing = User.query.filter(
            User.username == data['username'],
            User.id != user_id
        ).first()
        if existing:
            return jsonify({"error": "username already exists"}), 400
        user.username = data['username']
    
    # Update role if provided
    if 'role' in data:
        valid_roles = ['admin', 'analyst', 'data_operator']
        if data['role'] not in valid_roles:
            return jsonify({
                "error": f"role must be one of: {', '.join(valid_roles)}"
            }), 400
        user.role = data['role']
    
    # Update password if provided
    if 'password' in data and data['password']:
        user.set_password(data['password'])
    
    db.session.commit()
    return jsonify({
        "message": "user updated successfully",
        "user": user.to_dict()
    }), 200


@users_bp.route('/users/<int:user_id>', methods=['DELETE'])
@require_role('admin')
def delete_user(user_id, **kwargs):
    """Delete user (admin only)"""
    user = User.query.get_or_404(user_id)
    current_username = kwargs.get('current_username')
    
    # Prevent deleting yourself
    if current_username == user.username:
        return jsonify({"error": "cannot delete your own account"}), 400
    
    db.session.delete(user)
    db.session.commit()
    
    # Reset auto-increment to the maximum existing ID + 1
    result = db.session.execute("SELECT MAX(id) FROM user").scalar()
    next_id = 1 if result is None else result + 1
    db.session.execute(f"ALTER TABLE user AUTO_INCREMENT = {next_id}")
    db.session.commit()
    
    return jsonify({"message": "user deleted successfully"}), 200


# ----------------------------
# User Profile Management (Self)
# ----------------------------

@users_bp.route('/profile', methods=['GET'])
@require_auth
def get_profile(current_user, **kwargs):
    """Get current user's profile"""
    return jsonify(current_user.to_dict()), 200


@users_bp.route('/profile', methods=['PUT'])
@require_auth
def update_profile(current_user, **kwargs):

    data = request.get_json() or {}
    username_changed = False
    
    # Update username if provided
    if 'username' in data and data['username'] != current_user.username:
        # Check if username already exists (excluding current user)
        existing = User.query.filter(
            User.username == data['username'],
            User.id != current_user.id
        ).first()
        if existing:
            return jsonify({"error": "username already exists"}), 400
        current_user.username = data['username']
        username_changed = True
    
    # Update password if provided
    if 'password' in data and data['password']:
        current_user.set_password(data['password'])
    
    # Note: users cannot change their own role
    
    db.session.commit()
    
    # If username changed, issue a new token
    response_data = {
        "message": "profile updated successfully",
        "user": current_user.to_dict()
    }
    
    if username_changed:
        new_token = generate_token(current_user.username, current_user.role)
        response_data["token"] = new_token
    
    return jsonify(response_data), 200
