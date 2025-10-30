import React from "react";

export default function UserForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  editingUser, 
  error 
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5>{editingUser ? "Edit User" : "Create New User"}</h5>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-4">
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
            <div className="col-md-4">
              <label className="form-label">
                Password {editingUser && "(leave blank to keep current)"}
              </label>
              <input
                type="password"
                className="form-control"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editingUser}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Role</label>
              <select
                className="form-control"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <button type="submit" className="btn btn-success me-2">
              {editingUser ? "Update User" : "Create User"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}