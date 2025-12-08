import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Basic configuration"""
    
    # Flask
    DEBUG = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    # Database
    DB_HOST = os.getenv('DB_HOST')
    DB_PORT = os.getenv('DB_PORT')
    DB_NAME = os.getenv('DB_NAME')
    DB_USER = os.getenv('DB_USERNAME')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    
    # Build SQLAlchemy URI for mysql-connector-python
    SQLALCHEMY_DATABASE_URI = f'mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # CORS
    CORS_ORIGINS = os.getenv('FRONTEND_URL', 'http://localhost:3000').split(',')
