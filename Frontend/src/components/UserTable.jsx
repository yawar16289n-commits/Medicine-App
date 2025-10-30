import React from "react";

export default function UserTable({ users, onEdit, onDelete, loading }) {
  if (loading) {
    return <p>Loading users...</p>;
  }

  if (users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5>All Users ({users.length})</h5>
      </div>
      <div className="card-body">
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
                    onClick={() => onEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
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