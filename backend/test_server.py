"""Direct Flask test server"""
import sys
import os
os.chdir('D:\\Medicine-App-main\\backend')

from flask import Flask, jsonify
from database import db
from models import District, Formula, Medicine
from dotenv import load_dotenv

load_dotenv()

# Create simple test app
app = Flask(__name__)

DB_USERNAME = os.getenv('DB_USERNAME')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_NAME = os.getenv('DB_NAME')

app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+mysqlconnector://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route('/')
def home():
    return jsonify({"status": "running", "message": "Backend test server"})

@app.route('/api/districts')
def get_districts():
    districts = District.query.all()
    return jsonify([d.to_dict() for d in districts])

@app.route('/api/formulas')
def get_formulas():
    formulas = Formula.query.all()
    return jsonify([f.to_dict() for f in formulas])

@app.route('/api/medicines')
def get_medicines():
    medicines = Medicine.query.all()
    grouped = {}
    for med in medicines:
        formula_name = med.formula.name
        if formula_name not in grouped:
            grouped[formula_name] = []
        grouped[formula_name].append(med.to_dict())
    return jsonify(grouped)

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🧪 Test Server (No Scheduler)")
    print("="*60)
    print("Server: http://127.0.0.1:5000")
    print("="*60 + "\n")
    
    app.run(host='127.0.0.1', port=5000, debug=False)
