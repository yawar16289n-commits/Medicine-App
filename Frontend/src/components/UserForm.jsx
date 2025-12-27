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
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      <div className="bg-gray-100 px-6 py-4">
        <h5 className="text-xl font-bold text-gray-900">{editingUser ? "Edit User" : "Create New User"}</h5>
      </div>
      <div className="p-6">
        {error && <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {editingUser && "(leave blank to keep current)"}
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editingUser}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="admin">Admin</option>
                <option value="analyst">Analyst</option>
                <option value="data_operator">Data Operator</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium">
              {editingUser ? "Update User" : "Create User"}
            </button>
            <button type="button" className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}