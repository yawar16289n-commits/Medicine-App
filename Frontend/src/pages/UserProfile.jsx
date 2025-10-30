import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { useAuth } from "../contexts/AuthContext";
import ProfileDisplay from "../components/ProfileDisplay";
import ProfileForm from "../components/ProfileForm";

export default function UserProfile() {
  const { updateAuthState } = useAuth();
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

  // Get auth headers - always get fresh token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE}/api/profile`, {
        headers: getAuthHeaders()
      });
      setUser(res.data);
      setFormData({
        username: res.data.username,
        password: "",
        confirmPassword: ""
      });
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else {
        setError(err.response?.data?.error || "Failed to fetch profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle form submit
  const handleProfileUpdate = async () => {
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
      
      const response = await axios.put(`${API_BASE}/api/profile`, updateData, {
        headers: getAuthHeaders()
      });

      // Check if a new token was issued (username changed)
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.user.username);
        updateAuthState();
      }

      // Update the local state immediately with the response data
      setUser(response.data.user);
      setFormData({
        username: response.data.user.username,
        password: "",
        confirmPassword: ""
      });

      setSuccess("Profile updated successfully!");
      setEditing(false);
      
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
        // Don't handle logout here - let AuthContext handle it
      } else {
        setError(err.response?.data?.error || "Failed to update profile");
      }
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
              {editing ? (
                <ProfileForm
                  user={user}
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleProfileUpdate}
                  onCancel={cancelEdit}
                  error={error}
                  success={success}
                />
              ) : (
                <>
                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  <ProfileDisplay user={user} loading={false} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}