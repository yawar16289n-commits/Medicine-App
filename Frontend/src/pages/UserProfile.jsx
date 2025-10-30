import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/profile`, {
        headers: getAuthHeaders()
      });
      setUser(res.data);
      setFormData({
        username: res.data.username,
        password: "",
        confirmPassword: ""
      });
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate passwords match if changing password
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const updateData = {
        username: formData.username
      };

      // Only include password if it's being changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      await axios.put(`${API_BASE}/api/profile`, updateData, {
        headers: getAuthHeaders()
      });

      setSuccess("Profile updated successfully!");
      setEditing(false);
      
      // Update stored username if changed and using token auth
      const token = localStorage.getItem("token");
      if (token && formData.username !== user.username) {
        // Note: In a real app, you might want to issue a new token with the updated username
        // For now, we'll just refresh the profile data
        fetchProfile();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditing(false);
    setFormData({
      username: user.username,
      password: "",
      confirmPassword: ""
    });
    setError("");
    setSuccess("");
  };

  if (loading) {
    return <div className="container mt-4"><p>Loading profile...</p></div>;
  }

  if (!user) {
    return <div className="container mt-4"><p>Unable to load profile.</p></div>;
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4>My Profile</h4>
              {!editing && (
                <button
                  className="btn btn-primary"
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {editing ? (
                /* Edit Form */
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
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Display Mode */
                <div>
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Username:</strong>
                    </div>
                    <div className="col-sm-9">{user.username}</div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Role:</strong>
                    </div>
                    <div className="col-sm-9">
                      <span
                        className={`badge ${
                          user.role === "admin" ? "bg-danger" : "bg-primary"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Account Created:</strong>
                    </div>
                    <div className="col-sm-9">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>User ID:</strong>
                    </div>
                    <div className="col-sm-9">{user.id}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}