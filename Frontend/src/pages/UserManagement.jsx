import { useState, useEffect } from "react";
import UserTable from "../components/UserTable";
import { usersAPI, authAPI } from "../utils/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: ""  // No default role selected
  });

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await usersAPI.getAll();
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
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingUser) {
        // Update user
        await usersAPI.update(editingUser.id, formData);
      } else {
        // Create user
        await authAPI.register(formData);
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
    setShowModal(true);
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ username: "", password: "", role: "" });
    setError("");
    setShowModal(true);
  };

  // Delete user
  const deleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      await usersAPI.delete(userId);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete user");
    }
  };

  // Reset form
  const resetForm = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ username: "", password: "", role: "data_operator" });
    setError("");
  };

  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold text-gray-900 flex items-center gap-2">👥 User Management</h2>
        <button
          className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-lg transition-colors font-medium"
          onClick={openCreateModal}
        >
          + Add New User
        </button>
      </div>

      {/* Error display for general errors (not in modal) */}
      {error && !showModal && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Users Table */}
      <UserTable
        users={users}
        onEdit={startEdit}
        onDelete={deleteUser}
        loading={loading}
      />

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {editingUser && <span className="text-gray-500 text-xs">(leave blank to keep current)</span>}
                    {!editingUser && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingUser}
                    placeholder={editingUser ? "Enter new password (optional)" : "Enter password"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="analyst">Analyst</option>
                    <option value="data_operator">Data Operator</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}