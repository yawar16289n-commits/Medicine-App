import os
from flask import Flask
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from database import db
from models import Medicine
from routes import api_bp

load_dotenv()

DB_USERNAME = os.getenv('DB_USERNAME', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'medicines_db')

SQLALCHEMY_DATABASE_URI = f"mysql+mysqlconnector://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

# Initialize scheduler
scheduler = BackgroundScheduler()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app, 
         origins=[
             "http://localhost:5173",
             "http://127.0.0.1:5173",
             "http://localhost:5174",
             "http://127.0.0.1:5174"
         ], 
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         expose_headers=["Content-Type", "Authorization", "Content-Disposition"])
    
    db.init_app(app)
    migrate = Migrate(app, db)

    app.register_blueprint(api_bp)

    @app.route('/')
    def index():
        return {'message': 'Medicine API running'}

    # Setup daily weather update scheduler
    if not scheduler.running:
        with app.app_context():
            from services.weather_service import update_weather_database
            
            # Schedule daily update at 6:00 AM
            scheduler.add_job(
                func=lambda: update_weather_with_context(app),
                trigger="cron",
                hour=6,
                minute=0,
                id='daily_weather_update',
                name='Update weather forecast daily',
                replace_existing=True
            )
            
            # Run immediately on startup
            try:
                print("Running initial weather forecast update...")
                update_weather_database()
                print("Initial weather forecast update completed")
            except Exception as e:
                print(f"Initial weather update failed: {e}")
            
            scheduler.start()
            print("Weather forecast scheduler started - daily updates at 6:00 AM")

    return app

def update_weather_with_context(app):
    """Helper function to run weather update with Flask app context"""
    with app.app_context():
        from services.weather_service import update_weather_database
        try:
            update_weather_database()
            print("Scheduled weather forecast update completed")
        except Exception as e:
            print(f"Scheduled weather update failed: {e}")

if __name__ == '__main__':
    app = create_app()
    try:
        app.run(debug=True, port=5001, use_reloader=False)  
    finally:
        scheduler.shutdown()
