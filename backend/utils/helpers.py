from flask import jsonify
from models import User

def get_user_or_404(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return None, jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    return user, None, None
