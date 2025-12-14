from flask import Blueprint, jsonify, request
from models import User, Course
from database import db
from utils.helpers import get_user_or_404
from middleware.auth import require_owner

user_bp = Blueprint('users', __name__, url_prefix='/users')

@user_bp.route('/profile/<int:user_id>', methods=['GET'])
def get_public_profile(user_id):
    user, error_response, status_code = get_user_or_404(user_id)
    if error_response:
        return error_response, status_code
    
    profile = {
        'id': user.id,
        'name': user.name,
        'bio': user.bio,
        'profile_picture': user.profile_picture,
        'role': user.role
    }
    
    if user.role == 'instructor':
        created_courses = Course.query.filter_by(instructor_id=user_id, is_published=True).all()
        profile['courses'] = [course.to_dict() for course in created_courses]
        profile['total_courses'] = len(created_courses)
    
    return jsonify({
        'success': True,
        'profile': profile
    }), 200


@user_bp.route('/my-profile/<int:user_id>', methods=['GET'])
@require_owner
def get_my_profile(user_id):
    user, error_response, status_code = get_user_or_404(user_id)
    if error_response:
        return error_response, status_code
    
    profile = user.to_dict()
    
    return jsonify({
        'success': True,
        'profile': profile
    }), 200

@user_bp.route('/profile/<int:user_id>', methods=['PUT'])
@require_owner
def update_profile(user_id):
    user, error_response, status_code = get_user_or_404(user_id)
    if error_response:
        return error_response, status_code
    
    data = request.get_json()
    
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
