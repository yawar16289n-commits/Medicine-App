import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import ProfileDisplay from "../components/ProfileDisplay";
import ProfileForm from "../components/ProfileForm";
import { authAPI } from "../utils/api";
import { MESSAGES } from "../utils/constants";

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

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await authAPI.getProfile();
      setUser(res.data);
      setFormData({
        username: res.data.username,
        password: "",
        confirmPassword: ""
      });
    } catch (err) {
      if (err.response?.status === 401) {
        setError(MESSAGES.LOGIN_EXPIRED);
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
      
      const response = await authAPI.updateProfile(updateData);

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
        setError(MESSAGES.LOGIN_EXPIRED);
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">⚠️</span>
          <p className="text-xl text-gray-600">Unable to load profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings</p>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-2 border-green-400 text-green-700 px-6 py-4 rounded-xl mb-6 flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <span>{success}</span>
          </div>
        )}

        <div className="bg-white p-8 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-2">👤</span>
              {editing ? "Edit Profile" : "Profile Information"}
            </h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

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
            <ProfileDisplay user={user} loading={false} />
          )}
        </div>
      </div>
    </div>
  );
}