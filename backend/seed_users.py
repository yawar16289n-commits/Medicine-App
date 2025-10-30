#!/usr/bin/env python3
"""
Seed script to create initial users in the database
Run this script to create demo admin and user accounts
"""

from app import create_app
from database import db
from models import User

def seed_users():
    app = create_app()
    
    with app.app_context():
        # Check if users already exist
        if User.query.count() > 0:
            print("Users already exist in database. Skipping seed.")
            return
        
        # Create admin user
        admin = User(username='admin', role='admin')
        admin.set_password('adminpass')
        
        # Create regular user
        user = User(username='user', role='user')
        user.set_password('userpass')
        
        # Add to database
        db.session.add(admin)
        db.session.add(user)
        db.session.commit()
        
        print("Successfully created users:")
        print("- admin/adminpass (admin role)")
        print("- user/userpass (user role)")

if __name__ == '__main__':
    seed_users()