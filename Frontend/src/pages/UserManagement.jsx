import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import UserTable from "../components/UserTable";
import UserForm from "../components/UserForm";

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
  const handleFormSubmit = async () => {
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
      resetForm();
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

  // Reset form
  const resetForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ username: "", password: "", role: "user" });
    setError("");
  };

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

      {error && !showForm && <div className="alert alert-danger">{error}</div>}

      {/* User Form */}
      {showForm && (
        <UserForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleFormSubmit}
          onCancel={resetForm}
          editingUser={editingUser}
          error={error}
        />
      )}

      {/* Users Table */}
      <UserTable
        users={users}
        onEdit={startEdit}
        onDelete={deleteUser}
        loading={loading}
      />
    </div>
  );
}