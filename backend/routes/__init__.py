"""Routes package - modular API endpoints"""
from flask import Blueprint

# Create main API blueprint
api_bp = Blueprint('api', __name__, url_prefix='/api')

# Import and register sub-routes
from routes.course import courses_bp
from routes.auth import auth_bp
from routes.user import user_bp
from routes.dashboard import dashboard_bp
from routes.enrollment import enrollment_bp

# Register all sub-blueprints
api_bp.register_blueprint(courses_bp)
api_bp.register_blueprint(auth_bp)
api_bp.register_blueprint(user_bp)
api_bp.register_blueprint(dashboard_bp)
api_bp.register_blueprint(enrollment_bp)
