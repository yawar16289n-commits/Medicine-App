import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { updateAuthState } = useAuth();

  // where to go after login
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Try real backend login first
    try {
      const res = await axios.post(`${API_BASE}/api/login`, {
        username,
        password,
      });

      const { token, role } = res.data;
      // store token and role
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("username", username);
      // remove legacy mock flag if present
      localStorage.removeItem("auth");

      // Update auth context
      updateAuthState();
      
      navigate("/dashboard", { replace: true });
      return;
    } catch (err) {
      console.warn("Login API failed:", err.message || err);
      
      // Check if it's a network error (backend unreachable) vs credential error
      if (!err.response) {
        // Network error - backend unreachable, use mock auth
        if (username && password) {
          const role = username.toLowerCase() === "admin" ? "admin" : "user";
          localStorage.setItem("auth", "true");
          localStorage.setItem("role", role);
          localStorage.setItem("username", username);
          updateAuthState();
          navigate("/dashboard", { replace: true });
        } else {
          setError("Please enter username and password");
        }
      } else {
        // Backend responded with error (invalid credentials, etc.)
        setError(err.response?.data?.error || "Invalid credentials");
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button className="btn btn-primary" type="submit">
          Login
        </button>
        <p className="small text-muted mt-2">
          Tip: demo users: <strong>admin/adminpass</strong> (admin) or <strong>user/userpass</strong>
        </p>
      </form>
    </div>
  );
}
