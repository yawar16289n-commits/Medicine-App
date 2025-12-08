# WPL Learning Platform

A full-stack learning platform similar to Coursera, built with Flask (backend) and Next.js (frontend).

## Features

- User authentication (students, instructors, admins)
- Course management
- User profiles
- Enrollment system
- Dashboard

## Tech Stack

### Backend
- Flask 3.0.0
- MySQL 8.0+
- Flask-SQLAlchemy 3.1.1
- Flask-CORS 4.0.0
- Flask-Migrate 4.0.5

### Frontend
- Next.js 14.2.17
- React 18
- TypeScript 5
- Tailwind CSS 3.4.1

## Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file with your configuration:
```
DATABASE_URL=mysql+mysqlconnector://root:password@localhost/wpl_coursera
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

5. Initialize database:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

6. Run the backend server:
```bash
python app.py
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

4. Run the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Project Structure

```
WPL project/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── app.py          # Flask application
│   ├── config.py       # Configuration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/        # Next.js pages
│   │   ├── components/ # React components
│   │   ├── contexts/   # React contexts
│   │   └── lib/        # Utilities and API
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Courses
- `GET /api/courses/` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/` - Create course (instructor only)
- `PUT /api/courses/:id` - Update course (instructor only)
- `DELETE /api/courses/:id` - Delete course (instructor only)

### Enrollment
- `POST /api/enrollment/enroll` - Enroll in course
- `POST /api/enrollment/unenroll` - Unenroll from course
- `GET /api/enrollment/my-courses` - Get user's enrolled courses

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Development Status

✅ Completed:
- Backend API (authentication, courses, profiles, dashboards, enrollments)
- Frontend authentication integration (modal-based)
- User profile page with edit functionality
- Protected routes
- TypeScript error fixes

🚧 In Progress:
- Course listing and detail pages
- Enrollment UI
- Dashboard integration

## License

MIT
