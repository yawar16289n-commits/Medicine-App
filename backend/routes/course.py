from flask import Blueprint, jsonify, request
from models import Course

courses_bp = Blueprint('courses', __name__, url_prefix='/courses')

@courses_bp.route('/', methods=['GET'])
def get_courses():
    query = Course.query.filter_by(is_published=True)
    
    category = request.args.get('category')
    if category:
        query = query.filter_by(category=category)
    
    level = request.args.get('level')
    if level:
        query = query.filter_by(level=level)
    
    search = request.args.get('search')
    if search:
        search_pattern = f'%{search}%'
        query = query.filter(
            (Course.title.like(search_pattern)) | 
            (Course.description.like(search_pattern))
        )
    
    courses = query.all()
    courses_data = [course.to_dict() for course in courses]
    
    return jsonify({
        'success': True,
        'courses': courses_data,
        'total': len(courses_data)
    }), 200


@courses_bp.route('/<int:course_id>', methods=['GET'])
def get_course(course_id):
    from models import Course
    
    course = Course.query.get(course_id)
    
    if not course:
        return jsonify({
            'success': False,
            'error': 'Course not found'
        }), 404
    
    return jsonify({
        'success': True,
        'course': course.to_dict()
    }), 200
    
