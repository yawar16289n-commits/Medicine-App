# Backend Routes Refactoring

## 📁 New Structure

The monolithic `routes.py` (619 lines) has been refactored into a modular structure:

```
backend/
├── middleware/
│   ├── __init__.py
│   └── auth.py              # Authentication decorators and utilities
├── routes/
│   ├── __init__.py          # Main API blueprint aggregator
│   ├── auth.py              # Login, register endpoints
│   ├── users.py             # User CRUD and profile management
│   ├── medicines.py         # Medicine CRUD and file upload
│   └── forecast.py          # Forecasting endpoints
├── app.py                   # Flask app factory (updated)
└── routes_old.py            # Original file (backup)
```

---

## 🔧 What Changed

### **Before (routes.py - 619 lines)**
- All routes in one file
- Mixed concerns (auth, users, medicines, forecasting)
- Duplicate authentication logic
- Hard to test and maintain

### **After (Modular Structure)**

#### **1. middleware/auth.py**
Centralized authentication utilities:
- `get_current_user()` - Extract user from JWT token
- `@require_auth` - Decorator for authenticated endpoints
- `@require_role('admin', 'analyst')` - Role-based access control
- `generate_token()` - JWT token generation

#### **2. routes/auth.py**
Authentication endpoints:
- `POST /api/login` - User login
- `POST /api/register` - User registration

#### **3. routes/users.py**
User management:
- `GET /api/users` - List all users (admin only)
- `GET /api/users/<id>` - Get user by ID (admin only)
- `PUT /api/users/<id>` - Update user (admin only)
- `DELETE /api/users/<id>` - Delete user (admin only)
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update current user profile

#### **4. routes/medicines.py**
Medicine operations:
- `POST /api/medicines` - Create medicine
- `GET /api/medicines` - List all medicines (grouped by formula)
- `GET /api/medicines/<id>` - Get medicine by ID
- `PUT /api/medicines/<id>` - Update medicine
- `DELETE /api/medicines/<id>` - Delete medicine
- `POST /api/medicines/upload` - Bulk upload from CSV/Excel

#### **5. routes/forecast.py**
Forecasting operations:
- `GET /api/forecast/<medicine_name>` - Get forecast for medicine
- `POST /api/forecast/<medicine_name>/train` - Train forecasting model
- `GET /api/forecast/city` - City-wide aggregated forecast
- `GET /api/forecast/district/<name>` - District-level forecast

---

## ✅ Benefits

1. **Separation of Concerns** - Each file has a single responsibility
2. **Better Organization** - Easy to find and modify specific functionality
3. **Reusable Middleware** - Authentication logic in one place
4. **Easier Testing** - Can test each module independently
5. **Cleaner Imports** - No circular dependencies
6. **Scalability** - Easy to add new route modules

---

## 🔄 Migration Notes

### **No API Changes**
All endpoints remain the same - this is a **backend-only refactoring**.
Frontend code does NOT need to be modified.

### **Authentication Improvements**
The new decorators automatically inject user info:

**Old way:**
```python
@bp.route('/users', methods=['GET'])
@require_admin()
def get_all_users():
    # Had to manually extract user from token
    pass
```

**New way:**
```python
@users_bp.route('/users', methods=['GET'])
@require_role('admin')
def get_all_users(current_user_role, current_username, **kwargs):
    # User info automatically available
    pass
```

---

## 🚀 Usage Examples

### **Using the new decorators:**

```python
from middleware.auth import require_auth, require_role, generate_token

# Require authentication (any logged-in user)
@app.route('/protected')
@require_auth
def protected_route(current_user, **kwargs):
    return jsonify({"message": f"Hello {current_user.username}"})

# Require specific role
@app.route('/admin-only')
@require_role('admin')
def admin_route(**kwargs):
    return jsonify({"message": "Admin access granted"})

# Multiple roles allowed
@app.route('/staff-only')
@require_role('admin', 'analyst')
def staff_route(**kwargs):
    return jsonify({"message": "Staff access granted"})
```

---

## 📝 Testing

To test the refactored routes:

```bash
# Start the backend
cd backend
python app.py

# Test endpoints (same as before)
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

All endpoints work exactly the same as before!

---

## 🔮 Future Improvements

1. Add request validation with marshmallow or pydantic
2. Add comprehensive error handling middleware
3. Add rate limiting
4. Add API versioning (e.g., `/api/v1/...`)
5. Add OpenAPI/Swagger documentation
6. Add unit tests for each route module
7. Add logging middleware

---

## 🐛 Rollback

If you need to rollback to the old structure:

```bash
cd backend
rm -rf routes/ middleware/
mv routes_old.py routes.py
# Revert app.py import: from routes import bp
```
