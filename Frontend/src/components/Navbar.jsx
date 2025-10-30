import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const authed = localStorage.getItem("auth") === "true" || !!localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    // clear both token-based and mock auth
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to={authed ? "/medicines" : "/login"}>
          Medicine Manager
        </Link>
        {authed && (
          <div>
            <Link className="btn btn-sm btn-outline-light me-2" to="/medicines">
              Medicines
            </Link>
            <Link className="btn btn-sm btn-outline-light me-2" to="/dashboard">
              Dashboard
            </Link>
            {role === "admin" && (
              <Link className="btn btn-sm btn-outline-light me-2" to="/users">
                Users
              </Link>
            )}
            <Link className="btn btn-sm btn-outline-light me-2" to="/profile">
              Profile
            </Link>
            <button onClick={handleLogout} className="btn btn-sm btn-warning">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
