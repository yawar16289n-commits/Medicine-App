import React from "react";

export default function UserTable({ users, onEdit, onDelete, loading }) {
  if (loading) {
    return <p>Loading users...</p>;
  }

  if (users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gray-100 px-6 py-4">
        <h5 className="text-xl font-bold text-gray-900">All Users ({users.length})</h5>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.username}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                      user.role === "admin" 
                        ? "bg-red-600" 
                        : user.role === "analyst"
                        ? "bg-blue-600"
                        : "bg-primary-500"
                    }`}
                  >
                    {user.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm">
                  <button
                    className="px-3 py-1 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 mr-2 transition-colors"
                    onClick={() => onEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    onClick={() => onDelete(user.id, user.username)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}