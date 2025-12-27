from flask import Blueprint, jsonify, request
from models import User, Course, Enrollment
from database import db
from datetime import datetime

enrollment_bp = Blueprint('enrollment', __name__, url_prefix='/enrollments')

@enrollment_bp.route('/', methods=['POST'])
def enroll_in_course():
    data = request.get_json()
    
    if not data or 'user_id' not in data or 'course_id' not in data:
        return jsonify({
            'success': False,
            'error': 'user_id and course_id are required'
        }), 400
    
    user_id = data['user_id']
    course_id = data['course_id']
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    course = Course.query.get(course_id)
    if not course:
        return jsonify({
            'success': False,
            'error': 'Course not found'
        }), 404
    
    if not course.is_published:
        return jsonify({
            'success': False,
            'error': 'Course is not available for enrollment'
        }), 400
    
    existing_enrollment = Enrollment.query.filter_by(
        user_id=user_id,
        course_id=course_id
    ).first()
    
    if existing_enrollment:
        if existing_enrollment.status == 'dropped':
            existing_enrollment.status = 'active'
            existing_enrollment.enrolled_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Re-enrolled in course successfully',
                'enrollment': existing_enrollment.to_dict()
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Already enrolled in this course'
            }), 400
    
    new_enrollment = Enrollment(
        user_id=user_id,
        course_id=course_id,
        progress=0,
        status='active',
        enrolled_at=datetime.utcnow()
    )
    
    db.session.add(new_enrollment)
    
    course.total_students += 1
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Enrolled in course successfully',
        'enrollment': new_enrollment.to_dict()
    }), 201


@enrollment_bp.route('/<int:enrollment_id>', methods=['DELETE'])
def unenroll_from_course(enrollment_id):
    enrollment = Enrollment.query.get(enrollment_id)
    
    if not enrollment:
        return jsonify({
            'success': False,
            'error': 'Enrollment not found'
        }), 404
    
    if enrollment.status == 'dropped':
        return jsonify({
            'success': False,
            'error': 'Already unenrolled from this course'
        }), 400
    
    enrollment.status = 'dropped'
    
    course = Course.query.get(enrollment.course_id)
    if course and course.total_students > 0:
        course.total_students -= 1
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Unenrolled from course successfully'
    }), 200


@enrollment_bp.route('/check/<int:user_id>/<int:course_id>', methods=['GET'])
def check_enrollment(user_id, course_id):
    enrollment = Enrollment.query.filter_by(
        user_id=user_id,
        course_id=course_id
    ).first()
    
    if not enrollment or enrollment.status == 'dropped':
        return jsonify({
            'success': True,
            'enrolled': False,
            'enrollment': None
        }), 200
    
    return jsonify({
        'success': True,
        'enrolled': True,
        'enrollment': enrollment.to_dict()
    }), 200


@enrollment_bp.route('/<int:enrollment_id>/progress', methods=['PUT'])
def update_progress(enrollment_id):
    
    enrollment = Enrollment.query.get(enrollment_id)
    
    if not enrollment:
        return jsonify({
            'success': False,
            'error': 'Enrollment not found'
        }), 404
    
    data = request.get_json()
    
    if not data or 'progress' not in data:
        return jsonify({
            'success': False,
            'error': 'progress is required'
        }), 400
    
    progress = data['progress']
    
    if not isinstance(progress, (int, float)) or progress < 0 or progress > 100:
        return jsonify({
            'success': False,
            'error': 'progress must be a number between 0 and 100'
        }), 400
    
    enrollment.progress = progress
    
    if progress >= 100 and enrollment.status == 'active':
        enrollment.status = 'completed'
        enrollment.completed_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Progress updated successfully',
        'enrollment': enrollment.to_dict()
    }), 200


@enrollment_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_enrollments(user_id):
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    status = request.args.get('status')
    
    query = Enrollment.query.filter_by(user_id=user_id)
    
    if status:
        query = query.filter_by(status=status)
    
    enrollments = query.all()
    
    return jsonify({
        'success': True,
        'enrollments': [enrollment.to_dict() for enrollment in enrollments],
        'total': len(enrollments)
    }), 200
