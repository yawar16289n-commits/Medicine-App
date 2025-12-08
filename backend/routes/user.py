"""
User Profile Routes - get and update user profile
"""
from flask import Blueprint, jsonify, request
from models import User, Course
from database import db

# Create blueprint
user_bp = Blueprint('users', __name__, url_prefix='/users')

@user_bp.route('/profile/<int:user_id>', methods=['GET'])
def get_public_profile(user_id):
    """
    Get PUBLIC profile (viewed by others)
    - Shows basic info (name, bio, role, picture)
    - For instructors: shows their created courses
    - For students: no enrolled courses shown (privacy)
    """
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    # Basic public profile
    profile = {
        'id': user.id,
        'name': user.name,
        'bio': user.bio,
        'profile_picture': user.profile_picture,
        'role': user.role
    }
    
    # If instructor, show their created courses
    if user.role == 'instructor':
        created_courses = Course.query.filter_by(instructor_id=user_id, is_published=True).all()
        profile['courses'] = [course.to_dict() for course in created_courses]
        profile['total_courses'] = len(created_courses)
    
    return jsonify({
        'success': True,
        'profile': profile
    }), 200


@user_bp.route('/my-profile/<int:user_id>', methods=['GET'])
def get_my_profile(user_id):
    """
    Get OWN profile (viewed by self)
    - Shows full info including email
    - No courses displayed (courses are in dashboard)
    """
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    # Full profile info (including email)
    profile = user.to_dict()
    
    return jsonify({
        'success': True,
        'profile': profile
    }), 200


@user_bp.route('/profile/<int:user_id>', methods=['PUT'])
def update_profile(user_id):
    """
    Update user profile
    Expects JSON: { name, bio, profile_picture }
    """
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    data = request.get_json()
    
    # Update allowed fields
    if 'name' in data:
        user.name = data['name']
    if 'bio' in data:
        user.bio = data['bio']
    if 'profile_picture' in data:
        user.profile_picture = data['profile_picture']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Profile updated successfully',
        'profile': user.to_dict()
    }), 200
