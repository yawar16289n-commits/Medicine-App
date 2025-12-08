"""
Add sample data to database
"""
from app import create_app, db
from models import User, Course, Enrollment

app = create_app()

with app.app_context():
    print("Dropping existing tables...")
    db.drop_all()
    
    print("Creating tables with updated schema...")
    db.create_all()
    
    print("\n📝 Adding sample data...\n")
    
    # Create sample users
    print("Creating users...")
    
    # Learners
    learner1 = User(
        name="John Doe",
        email="john@example.com",
        password="password123",  # Plain password for now (no security)
        role="learner",
        bio="Aspiring data scientist"
    )
    
    learner2 = User(
        name="Jane Smith",
        email="jane@example.com",
        password="password123",
        role="learner",
        bio="Web developer"
    )
    
    # Instructors
    instructor1 = User(
        name="Dr. Rachele Tongchitpakdee",
        email="rachele@colorado.edu",
        password="instructor123",
        role="instructor",
        profile_picture="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
        bio="Professor of data science with 15+ years of industry experience"
    )
    
    instructor2 = User(
        name="Meta Developers",
        email="meta@meta.com",
        password="instructor123",
        role="instructor",
        profile_picture="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
        bio="Experienced engineers from Meta building production-grade React applications"
    )
    
    instructor3 = User(
        name="Andrew Ng",
        email="andrew@deeplearning.ai",
        password="instructor123",
        role="instructor",
        profile_picture="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80",
        bio="Pioneer in machine learning and AI education, co-founder of Coursera"
    )
    
    # Admin
    admin = User(
        name="Admin User",
        email="admin@coursera.com",
        password="admin123",
        role="admin",
        bio="Platform Administrator"
    )
    
    db.session.add_all([learner1, learner2, instructor1, instructor2, instructor3, admin])
    db.session.commit()
    print(f"✅ Created {User.query.count()} users")
    
    # Create sample courses
    print("\nCreating courses...")
    
    course1 = Course(
        title="Python for Data Science",
        description="Learn data science fundamentals including statistical analysis, data visualization, and predictive modeling.",
        about="Master the core skills of data science. This comprehensive specialization covers data collection, cleaning, analysis, and visualization.",
        instructor_id=instructor1.id,
        company="University of Colorado Boulder",
        category="Data Science",
        level="Beginner",
        price=49.00,
        duration="4-5 months",
        image="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop&q=80",
        rating=4.7,
        total_students=185000,
        total_reviews=3245,
        is_published=True
    )
    
    course2 = Course(
        title="Web Development with React",
        description="Build modern web applications with React. Learn component-based architecture, state management, and advanced patterns.",
        about="Learn to build scalable web applications with React from Meta engineers. Covers modern JavaScript, React fundamentals, and state management.",
        instructor_id=instructor2.id,
        company="Meta",
        category="Web Development",
        level="Intermediate",
        price=49.00,
        duration="3-4 months",
        image="https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop&q=80",
        rating=4.8,
        total_students=225000,
        total_reviews=4156,
        is_published=True
    )
    
    course3 = Course(
        title="Machine Learning Specialization",
        description="Master machine learning fundamentals. Learn supervised learning, unsupervised learning, and neural networks.",
        about="Broad introduction to machine learning covering the most important techniques used in AI today.",
        instructor_id=instructor3.id,
        company="DeepLearning.AI",
        category="Machine Learning",
        level="Advanced",
        price=49.00,
        duration="3 months",
        image="https://images.unsplash.com/photo-1518432031498-7794beeba4c0?w=800&h=400&fit=crop&q=80",
        rating=4.9,
        total_students=500000,
        total_reviews=8932,
        is_published=True
    )
    
    db.session.add_all([course1, course2, course3])
    db.session.commit()
    print(f"✅ Created {Course.query.count()} courses")
    
    # Create sample enrollments
    print("\nCreating enrollments...")
    
    enrollment1 = Enrollment(
        user_id=learner1.id,
        course_id=course1.id,
        progress=45,
        status='active'
    )
    
    enrollment2 = Enrollment(
        user_id=learner1.id,
        course_id=course2.id,
        progress=65,
        status='active'
    )
    
    enrollment3 = Enrollment(
        user_id=learner1.id,
        course_id=course3.id,
        progress=30,
        status='active'
    )
    
    enrollment4 = Enrollment(
        user_id=learner2.id,
        course_id=course2.id,
        progress=80,
        status='active'
    )
    
    db.session.add_all([enrollment1, enrollment2, enrollment3, enrollment4])
    db.session.commit()
    print(f"✅ Created {Enrollment.query.count()} enrollments")
    
    print("\n" + "="*50)
    print("✅ Sample data added successfully!")
    print("="*50)
    print("\n📝 Sample Login Credentials:")
    print("-" * 50)
    print("Learner:")
    print("  Email: john@example.com")
    print("  Password: password123")
    print("\nInstructor:")
    print("  Email: rachele@colorado.edu")
    print("  Password: instructor123")
    print("\nAdmin:")
    print("  Email: admin@coursera.com")
    print("  Password: admin123")
    print("-" * 50)
