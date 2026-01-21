"""Routes package - modular API endpoints"""
from flask import Blueprint

# Create main API blueprint
api_bp = Blueprint('api', __name__, url_prefix='/api')

# Import and register sub-routes
from routes.auth import auth_bp
from routes.users import users_bp
from routes.medicines import medicines_bp
from routes.districts import districts_bp
from routes.formulas import formulas_bp
from routes.forecast import forecast_bp
from routes.weather import weather_bp
from routes.activities import activities_bp
from routes.reports import reports_bp

# Register all sub-blueprints
api_bp.register_blueprint(auth_bp)
api_bp.register_blueprint(users_bp)
api_bp.register_blueprint(medicines_bp)
api_bp.register_blueprint(districts_bp)
api_bp.register_blueprint(formulas_bp)
api_bp.register_blueprint(forecast_bp)
api_bp.register_blueprint(weather_bp)
api_bp.register_blueprint(activities_bp)
api_bp.register_blueprint(reports_bp)
