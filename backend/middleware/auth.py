from flask import request, jsonify
from functools import wraps

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = request.headers.get('X-User-Id')
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'Authentication required'
            }), 401
        
        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid user ID'
            }), 401
        
        request.user_id = user_id
        return f(*args, **kwargs)
    
    return decorated_function

def require_owner(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = request.headers.get('X-User-Id')
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'Authentication required'
            }), 401
        
        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid user ID'
            }), 401
        
        route_user_id = kwargs.get('user_id')
        
        if route_user_id and user_id != route_user_id:
            return jsonify({
                'success': False,
                'error': 'Unauthorized access'
            }), 403
        
        request.user_id = user_id
        return f(*args, **kwargs)
    
    return decorated_function
