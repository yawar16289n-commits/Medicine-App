# models.py
from database import db
from werkzeug.security import generate_password_hash, check_password_hash

class Activity(db.Model):
    __tablename__ = 'activity'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user_name = db.Column(db.String(80), nullable=False)
    action_type = db.Column(db.String(50), nullable=False)  # 'create', 'update', 'delete', 'upload'
    entity_type = db.Column(db.String(50), nullable=False)  # 'sales_record', 'stock_adjustment', 'medicine', etc.
    entity_id = db.Column(db.String(100))  # ID of the affected entity
    details = db.Column(db.Text)  # JSON string with additional details
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=False, index=True)
    
    # Relationship
    user = db.relationship('User', backref='activities')
    
    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "userName": self.user_name,
            "actionType": self.action_type,
            "entityType": self.entity_type,
            "entityId": self.entity_id,
            "details": self.details,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)  # Hashed password
    role = db.Column(db.String(20), nullable=False, default='data_operator')  # admin, analyst, data_operator
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def set_password(self, password):
        """Hash and set password using bcrypt via werkzeug"""
        self.password = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        """Check if provided password matches the hashed password"""
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class WeatherData(db.Model):
    __tablename__ = 'weather_data'
    
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, unique=True, nullable=False, index=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    apparent_temperature_max = db.Column(db.Float)
    apparent_temperature_min = db.Column(db.Float)
    apparent_temperature_mean = db.Column(db.Float)
    relative_humidity_2m_mean = db.Column(db.Float)
    relative_humidity_2m_max = db.Column(db.Float)
    relative_humidity_2m_min = db.Column(db.Float)
    is_forecast = db.Column(db.Boolean, default=False, nullable=False)  # Distinguish forecast from historical
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.date.isoformat() if self.date else None,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "apparentTemperatureMax": self.apparent_temperature_max,
            "apparentTemperatureMin": self.apparent_temperature_min,
            "apparentTemperatureMean": self.apparent_temperature_mean,
            "relativeHumidity2mMean": self.relative_humidity_2m_mean,
            "relativeHumidity2mMax": self.relative_humidity_2m_max,
            "relativeHumidity2mMin": self.relative_humidity_2m_min,
            "isForecast": self.is_forecast,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None
        }


class District(db.Model):
    __tablename__ = 'district'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    area_code = db.Column(db.String(20), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relationships
    sales = db.relationship('MedicineSales', back_populates='district', foreign_keys='MedicineSales.district_id', lazy='dynamic', cascade='all, delete-orphan')
    forecasts = db.relationship('MedicineForecast', back_populates='district', foreign_keys='MedicineForecast.district_id', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "areaCode": self.area_code,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }


class Formula(db.Model):
    __tablename__ = 'formula'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    therapeutic_class = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relationships
    medicines = db.relationship('Medicine', back_populates='formula', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "therapeuticClass": self.therapeutic_class or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }


class Medicine(db.Model):
    __tablename__ = 'medicine'
    
    id = db.Column(db.Integer, primary_key=True)
    formula_id = db.Column(db.Integer, db.ForeignKey('formula.id'), nullable=False, index=True)
    brand_name = db.Column(db.String(100), nullable=False, index=True)
    dosage_strength = db.Column(db.String(50), nullable=True)
    therapeutic_class = db.Column(db.String(100), nullable=True)
    stock_level = db.Column(db.Integer, default=0, nullable=False)  # Current stock quantity
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relationships
    formula = db.relationship('Formula', back_populates='medicines')
    sales = db.relationship('MedicineSales', back_populates='medicine', foreign_keys='MedicineSales.medicine_id', lazy='dynamic', cascade='all, delete-orphan')
    forecasts = db.relationship('MedicineForecast', back_populates='medicine', foreign_keys='MedicineForecast.medicine_id', lazy='dynamic', cascade='all, delete-orphan')
    

    
    def to_dict(self):
        # Calculate total sale quantity from sales records
        total_sale_quantity = sum(sale.quantity for sale in self.sales.all())
        
        return {
            "id": self.id,
            "formulaId": self.formula_id,
            "formulaName": self.formula.name if self.formula else None,
            "brandName": self.brand_name,
            "dosageStrength": self.dosage_strength,
            "therapeuticClass": self.therapeutic_class,
            "stockLevel": self.stock_level,
            "saleQuantity": total_sale_quantity,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }


class MedicineSales(db.Model):
    __tablename__ = 'medicine_sales'
    
    id = db.Column(db.Integer, primary_key=True)
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicine.id'), nullable=False, index=True)
    district_id = db.Column(db.Integer, db.ForeignKey('district.id'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, index=True)
    quantity = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relationships
    medicine = db.relationship('Medicine', back_populates='sales')
    district = db.relationship('District', back_populates='sales')
    
    # Composite index for faster queries
    __table_args__ = (
        db.Index('idx_medicine_district_date', 'medicine_id', 'district_id', 'date'),
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "medicineId": self.medicine_id,
            "medicineName": self.medicine.brand_name if self.medicine else None,
            "dosageStrength": self.medicine.dosage_strength if self.medicine else None,
            "formulaName": self.medicine.formula.name if self.medicine and self.medicine.formula else None,
            "districtId": self.district_id,
            "districtName": self.district.name if self.district else None,
            "date": self.date.isoformat() if self.date else None,
            "quantity": self.quantity,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }


class MedicineForecast(db.Model):
    __tablename__ = 'medicine_forecast'
    
    id = db.Column(db.Integer, primary_key=True)
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicine.id'), nullable=False, index=True)
    district_id = db.Column(db.Integer, db.ForeignKey('district.id'), nullable=False, index=True)
    forecast_date = db.Column(db.Date, nullable=False, index=True)
    forecasted_quantity = db.Column(db.Integer, nullable=False)
    model_version = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relationships
    medicine = db.relationship('Medicine', back_populates='forecasts')
    district = db.relationship('District', back_populates='forecasts')
    
    # Composite unique index - one forecast per medicine per district per date
    __table_args__ = (
        db.Index('idx_forecast_medicine_district_date', 'medicine_id', 'district_id', 'forecast_date', unique=True),
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "medicineId": self.medicine_id,
            "districtId": self.district_id,
            "districtName": self.district.name if self.district else None,
            "forecastDate": self.forecast_date.isoformat() if self.forecast_date else None,
            "forecastedQuantity": self.forecasted_quantity,
            "modelVersion": self.model_version,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }


class DistrictMedicineLookup(db.Model):
    __tablename__ = 'district_medicine_lookup'
    
    id = db.Column(db.Integer, primary_key=True)
    district_id = db.Column(db.Integer, db.ForeignKey('district.id'), nullable=False, index=True)
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicine.id'), nullable=False, index=True)
    formula_id = db.Column(db.Integer, db.ForeignKey('formula.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relationships
    district = db.relationship('District', foreign_keys=[district_id])
    medicine = db.relationship('Medicine', foreign_keys=[medicine_id])
    formula = db.relationship('Formula', foreign_keys=[formula_id])
    
    # Composite unique index
    __table_args__ = (
        db.Index('idx_district_medicine_formula', 'district_id', 'medicine_id', 'formula_id', unique=True),
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "districtId": self.district_id,
            "districtName": self.district.name if self.district else None,
            "medicineId": self.medicine_id,
            "medicineName": self.medicine.brand_name if self.medicine else None,
            "formulaId": self.formula_id,
            "formulaName": self.formula.name if self.formula else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }
