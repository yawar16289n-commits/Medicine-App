import os
from flask import Flask
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask_cors import CORS
from database import db
from models import Medicine
from routes import bp

load_dotenv()

DB_USERNAME = os.getenv('DB_USERNAME', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'medicines_db')

SQLALCHEMY_DATABASE_URI = f"mysql+mysqlconnector://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:3000"])
    
    db.init_app(app)
    migrate = Migrate(app, db)

    app.register_blueprint(bp)

    @app.route('/')
    def index():
        return {'message': 'Backlinks API running'}

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
