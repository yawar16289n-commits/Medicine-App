import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user"
  });

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/users`, {
        headers: getAuthHeaders()
      });
      setUsers(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingUser) {
        // Update user
        await axios.put(
          `${API_BASE}/api/users/${editingUser.id}`,
          formData,
          { headers: getAuthHeaders() }
        );
      } else {
        // Create user
        await axios.post(
          `${API_BASE}/api/register`,
          formData,
          { headers: getAuthHeaders() }
        );
      }
      
      // Reset form and refresh users
      setFormData({ username: "", password: "", role: "user" });
      setShowForm(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Operation failed");
    }
  };

  // Start editing user
  const startEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "", // Don't prefill password
      role: user.role
    });
    setShowForm(true);
  };

  // Delete user
  const deleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/api/users/${userId}`, {
        headers: getAuthHeaders()
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete user");
    }
  };

  // Cancel form
  const cancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ username: "", password: "", role: "user" });
    setError("");
  };

  if (loading) {
    return <div className="container mt-4"><p>Loading users...</p></div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={showForm}
        >
          Add New User
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* User Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>{editingUser ? "Edit User" : "Create New User"}</h5>
          </div>
          <div className="card-body">
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
                <button type="button" className="btn btn-secondary" onClick={cancelForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <h5>All Users ({users.length})</h5>
        </div>
        <div className="card-body">
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === "admin" ? "bg-danger" : "bg-primary"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => startEdit(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteUser(user.id, user.username)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}