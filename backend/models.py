# models.py
from database import db
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def set_password(self, password):
        """Hash and set the password"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Check if provided password matches the hash"""
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Medicine(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Formula group ID
    formula = db.Column(db.String(100), nullable=False)
    medicine_id = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    forecast = db.Column(db.Integer, nullable=False)
    stock_status = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "formula": self.formula,
            "medicineId": self.medicine_id,
            "name": self.name,
            "stock": self.stock,
            "forecast": self.forecast,
            "stockStatus": self.stock_status
        }
