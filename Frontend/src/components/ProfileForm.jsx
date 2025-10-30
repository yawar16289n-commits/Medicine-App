import React from "react";

export default function ProfileForm({ 
  user, 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  error, 
  success 
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords match if changing password
    if (formData.password && formData.password !== formData.confirmPassword) {
      return; // Let parent handle this validation
    }
    
    onSubmit();
  };

  return (
    <div className="card-body">
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            New Password (leave blank to keep current)
          </label>
          <input
            type="password"
            className="form-control"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Enter new password or leave blank"
          />
        </div>

        {formData.password && (
          <div className="mb-3">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Confirm new password"
              required
            />
          </div>
        )}

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success">
            Save Changes
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}