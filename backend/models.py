from datetime import datetime
from app import db
from sqlalchemy import Numeric

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('learner', 'instructor', 'admin'), nullable=False)
    profile_picture = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'profile_picture': self.profile_picture,
            'bio': self.bio,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    about = db.Column(db.Text, nullable=True)
    instructor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    company = db.Column(db.String(100), nullable=True)
    category = db.Column(db.String(50), nullable=False)
    level = db.Column(db.Enum('Beginner', 'Intermediate', 'Advanced'), default='Beginner')
    price = db.Column(Numeric(10, 2), default=0.00)
    duration = db.Column(db.String(50), nullable=True)
    image = db.Column(db.String(255), nullable=True)
    rating = db.Column(Numeric(3, 2), default=0.00)
    total_students = db.Column(db.Integer, default=0)
    total_reviews = db.Column(db.Integer, default=0)
    is_published = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'instructor_id': self.instructor_id,
            'company': self.company,
            'category': self.category,
            'level': self.level,
            'price': float(self.price),
            'duration': self.duration,
            'image': self.image,
            'rating': float(self.rating),
            'total_students': self.total_students,
            'total_reviews': self.total_reviews,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    progress = db.Column(db.Integer, default=0)
    status = db.Column(db.Enum('active', 'completed', 'dropped'), default='active')
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'course_id', name='unique_user_course'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'course_id': self.course_id,
            'progress': self.progress,
            'status': self.status,
            'enrolled_at': self.enrolled_at.isoformat() if self.enrolled_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
