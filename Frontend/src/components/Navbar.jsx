import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to={isAuthenticated ? "/medicines" : "/login"}>
          Medicine Manager
        </Link>
        {isAuthenticated && (
          <div>
            <Link className="btn btn-sm btn-outline-light me-2" to="/medicines">
              Medicines
            </Link>
            <Link className="btn btn-sm btn-outline-light me-2" to="/dashboard">
              Dashboard
            </Link>
            {user?.role === "admin" && (
              <Link className="btn btn-sm btn-outline-light me-2" to="/users">
                Users
              </Link>
            )}
            <Link className="btn btn-sm btn-outline-light me-2" to="/profile">
              Profile
            </Link>
            <button onClick={logout} className="btn btn-sm btn-warning">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
