"""Authentication middleware and decorators"""
import os
import jwt
import secrets
from functools import wraps
from flask import request, jsonify
from models import User

# Secret for JWTs - generate secure random secret if not set
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    # Generate a secure random secret for development
    JWT_SECRET = secrets.token_hex(32)
    print(f"WARNING: Using auto-generated JWT secret. Set JWT_SECRET environment variable for production.")
    print(f"Generated secret (save this): {JWT_SECRET}")


def get_current_user():
    """
    Extract and validate user from JWT token in Authorization header.
    
    Returns:
        tuple: (User object, error message) - User is None if authentication fails
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, "token required"
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        username = payload.get('sub')
        user = User.query.filter_by(username=username).first()
        return user, None
    except jwt.ExpiredSignatureError:
        return None, "token expired"
    except jwt.InvalidTokenError:
        return None, "invalid token"
    except Exception:
        return None, "authentication error"


def require_auth(f):
    """
    Decorator to require authentication for endpoints.
    Validates JWT token and passes user info to the decorated function.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user, error = get_current_user()
        if not user:
            return jsonify({"error": error or "authentication required"}), 401
        
        # Pass user to the decorated function
        kwargs['current_user'] = user
        return f(*args, **kwargs)
    
    return decorated_function


def require_role(allowed_roles):
    """
    Decorator to require specific role(s) for endpoints.
    
    Args:
        allowed_roles: List of role strings or single role string (e.g., ['admin', 'analyst'] or 'admin')
    
    Usage:
        @require_role(['admin', 'analyst'])
        @require_role('admin')
    """
    # Normalize to list
    if isinstance(allowed_roles, str):
        allowed_roles = [allowed_roles]
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({"error": "token required"}), 401
            
            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
                user_role = payload.get('role')
                
                if user_role not in allowed_roles:
                    return jsonify({"error": f"access denied - requires one of: {', '.join(allowed_roles)}"}), 403
                
                # Optionally pass user info to decorated function
                kwargs['current_user_role'] = user_role
                kwargs['current_username'] = payload.get('sub')
                
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "token expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "invalid token"}), 401
                
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def generate_token(username, role, expires_hours=8):
    """
    Generate a JWT token for a user.
    
    Args:
        username (str): User's username
        role (str): User's role
        expires_hours (int): Token expiration time in hours
    
    Returns:
        str: JWT token
    """
    import datetime
    
    payload = {
        "sub": username,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=expires_hours)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')
