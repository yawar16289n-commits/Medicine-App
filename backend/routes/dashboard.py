"""
Dashboard Routes - Student and Instructor dashboards
"""
from flask import Blueprint, jsonify
from models import User, Enrollment, Course
from database import db

# Create blueprint
dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')

@dashboard_bp.route('/student/<int:user_id>', methods=['GET'])
def get_student_dashboard(user_id):
    """
    Get STUDENT dashboard
    - Shows enrolled courses (in-progress, completed)
    - Shows progress stats
    """
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    # Get enrollments with course details
    enrollments = Enrollment.query.filter_by(user_id=user_id).all()
    
    in_progress = []
    completed = []
    
    for enrollment in enrollments:
        course_data = enrollment.to_dict()
        if enrollment.status == 'active':
            in_progress.append(course_data)
        elif enrollment.status == 'completed':
            completed.append(course_data)
    
    dashboard_data = {
        'user': user.to_dict(),
        'enrolled_courses': {
            'in_progress': in_progress,
            'completed': completed
        },
        'stats': {
            'total_enrolled': len(enrollments),
            'in_progress': len(in_progress),
            'completed': len(completed)
        }
    }
    
    return jsonify({
        'success': True,
        'dashboard': dashboard_data
    }), 200


@dashboard_bp.route('/instructor/<int:user_id>', methods=['GET'])
def get_instructor_dashboard(user_id):
    """
    Get INSTRUCTOR dashboard
    - Shows created courses
    - Shows course analytics (students, reviews)
    """
    user = User.query.get(user_id)
    
    if not user or user.role != 'instructor':
        return jsonify({
            'success': False,
            'error': 'User not found or not an instructor'
        }), 404
    
    # Get instructor's created courses
    courses = Course.query.filter_by(instructor_id=user_id).all()
    
    published_courses = [c.to_dict() for c in courses if c.is_published]
    draft_courses = [c.to_dict() for c in courses if not c.is_published]
    
    # Calculate total students across all courses
    total_students = sum(course.total_students for course in courses)
    total_reviews = sum(course.total_reviews for course in courses)
    
    dashboard_data = {
        'user': user.to_dict(),
        'created_courses': {
            'published': published_courses,
            'drafts': draft_courses
        },
        'stats': {
            'total_courses': len(courses),
            'published': len(published_courses),
            'drafts': len(draft_courses),
            'total_students': total_students,
            'total_reviews': total_reviews
        }
    }
    
    return jsonify({
        'success': True,
        'dashboard': dashboard_data
    }), 200
