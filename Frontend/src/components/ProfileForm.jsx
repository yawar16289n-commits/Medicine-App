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
    <div className="p-6">
      {error && <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-lg mb-4">{error}</div>}
      {success && <div className="bg-green-50 border-l-4 border-green-400 text-green-800 p-4 rounded-lg mb-4">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password (leave blank to keep current)
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Enter new password or leave blank"
          />
        </div>

        {formData.password && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Confirm new password"
              required
            />
          </div>
        )}

        <div className="flex gap-2">
          <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium">
            Save Changes
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}