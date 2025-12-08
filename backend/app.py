from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config
from database import db
from routes import api_bp

def create_app():
    """Create Flask application"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(Config)

    CORS(app, origins=app.config['CORS_ORIGINS'])

    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)

    app.register_blueprint(api_bp)
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return {'status': 'ok', 'message': 'Server is running'}, 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
