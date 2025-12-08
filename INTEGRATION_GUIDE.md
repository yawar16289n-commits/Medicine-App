# Frontend-Backend Integration Guide

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
# Make sure Flask server is running
$env:FLASK_APP='app.py'
.\venv\Scripts\python.exe -m flask run
```

Backend should be running on: `http://localhost:5000`

### 2. Frontend Setup
```bash
cd frontend
# Install dependencies if needed
npm install

# Run development server
npm run dev
```

Frontend should be running on: `http://localhost:3000`

## Authentication Integration - Complete ✅

### What's Been Implemented:

#### 1. API Service (`src/lib/api.ts`)
- Centralized API communication with backend
- Functions for all endpoints:
  - **Auth**: signup, login, getUser
  - **User**: getPublicProfile, getMyProfile, updateProfile
  - **Course**: getCourses, getCourse
  - **Dashboard**: getStudentDashboard, getInstructorDashboard
  - **Enrollment**: enroll, unenroll, checkEnrollment, updateProgress, getUserEnrollments

#### 2. Auth Context (`src/contexts/AuthContext.tsx`)
- Global authentication state management
- User data persistence (localStorage)
- Login/Signup/Logout functions
- `useAuth()` hook for accessing auth state

#### 3. Protected Routes (`src/components/ProtectedRoute.tsx`)
- Wrapper component for authenticated pages
- Automatic redirect to login if not authenticated
- Role-based access control support

#### 4. Authentication Pages
- **Login** (`src/app/login/page.tsx`):
  - Email/password form
  - Error handling
  - Redirect to dashboard on success
  - Test account credentials displayed

- **Signup** (`src/app/signup/page.tsx`):
  - Registration form with validation
  - Role selection (learner/instructor)
  - Password confirmation
  - Redirect to dashboard on success

#### 5. Navigation (`src/components/Navbar.tsx`)
- Dynamic navigation based on auth state
- User welcome message
- Login/Signup buttons for guests
- Profile/Logout for authenticated users

#### 6. Dashboard Integration (Ready)
- Created structure in `src/app/dashboard/page.tsx`
- Protected route wrapper
- Student dashboard with enrolled courses
- Instructor dashboard with created courses
- Stats display (enrollments, courses, students, reviews)

## Test the Integration

### Test Accounts (from sample data):
1. **Student Account**:
   - Email: `john@example.com`
   - Password: `password123`
   - Role: learner

2. **Instructor Account**:
   - Email: `rachele@example.com`
   - Password: `password123`
   - Role: instructor

### Testing Flow:

1. **Visit Homepage**: `http://localhost:3000`
   - Should see Navbar with Login/Signup buttons

2. **Test Signup**: `http://localhost:3000/signup`
   - Create new account
   - Should redirect to dashboard after success

3. **Test Login**: `http://localhost:3000/login`
   - Use test credentials above
   - Should redirect to dashboard

4. **View Dashboard**: `http://localhost:3000/dashboard`
   - Protected route (requires login)
   - Student: See enrolled courses, progress
   - Instructor: See created courses, stats

5. **Test Logout**:
   - Click Logout button in navbar
   - Should clear user data and redirect

## API Endpoints Being Used

All API calls go through `src/lib/api.ts`:

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login to account
- `GET /api/auth/users/:id` - Get user details

### Dashboard
- `GET /api/dashboard/student/:id` - Student dashboard data
- `GET /api/dashboard/instructor/:id` - Instructor dashboard data

### Profiles
- `GET /api/users/profile/:id` - Public profile
- `GET /api/users/my-profile/:id` - Own profile
- `PUT /api/users/profile/:id` - Update profile

### Courses
- `GET /api/courses/` - List all courses (with filters)
- `GET /api/courses/:id` - Get course details

### Enrollments
- `POST /api/enrollments/` - Enroll in course
- `DELETE /api/enrollments/:id` - Unenroll from course
- `GET /api/enrollments/check/:uid/:cid` - Check enrollment status
- `PUT /api/enrollments/:id/progress` - Update progress
- `GET /api/enrollments/user/:id` - Get user's enrollments

## Environment Variables

`.env.local` (already created):
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Next Steps

1. ✅ Authentication integration - COMPLETE
2. 🔄 Update existing dashboard page to use real API data
3. 📝 Course listing page integration
4. 📝 Course detail page integration
5. 📝 Enrollment functionality
6. 📝 Profile page integration

## Common Issues

### CORS Errors
- Backend has Flask-CORS configured for `http://localhost:3000`
- If you see CORS errors, check backend CORS settings in `app.py`

### API Connection Refused
- Make sure Flask backend is running on port 5000
- Check the `NEXT_PUBLIC_API_URL` in `.env.local`

### Authentication Not Persisting
- User data stored in localStorage
- Clear browser cache/localStorage if issues occur

## File Structure

```
frontend/src/
├── app/
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── signup/
│   │   └── page.tsx          # Signup page
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard (ready for integration)
│   ├── layout.tsx            # Root layout with AuthProvider
│   └── page.tsx              # Homepage with Navbar
├── components/
│   ├── Navbar.tsx            # Navigation with auth state
│   └── ProtectedRoute.tsx    # Route protection wrapper
├── contexts/
│   └── AuthContext.tsx       # Auth state management
└── lib/
    └── api.ts                # API service layer
```
