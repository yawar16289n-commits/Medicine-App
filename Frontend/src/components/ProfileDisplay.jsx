import React from "react";

export default function ProfileDisplay({ user }) {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="font-semibold text-gray-700">Username:</div>
        <div className="md:col-span-2 text-gray-900">{user.username}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="font-semibold text-gray-700">Role:</div>
        <div className="md:col-span-2">
          <span
            className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
              user.role === "admin" ? "bg-red-600" : "bg-primary-500"
            }`}
          >
            {user.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="font-semibold text-gray-700">Account Created:</div>
        <div className="md:col-span-2 text-gray-900">
          {new Date(user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="font-semibold text-gray-700">User ID:</div>
        <div className="md:col-span-2 text-gray-900">{user.id}</div>
      </div>
    </div>
  );
}