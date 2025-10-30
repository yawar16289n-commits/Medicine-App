import React from "react";

export default function ProfileDisplay({ user }) {
  return (
    <div className="card-body">
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
  );
}