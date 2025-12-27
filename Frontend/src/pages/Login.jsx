import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../utils/api";
import { MESSAGES } from "../utils/constants";

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
      const res = await authAPI.login({ username, password });

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
        // Network error - backend unreachable, show error
        setError(MESSAGES.NETWORK_ERROR);
      } else {
        // Backend responded with error (invalid credentials, etc.)
        setError(err.response?.data?.error || "Invalid credentials");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 flex items-center justify-center p-4">
      {/* Fixed position back button */}
      <div className="fixed top-8 left-8 z-10">
        <button
          onClick={() => navigate("/")}
          className="bg-white bg-opacity-20 border-2 border-white border-opacity-30 text-white px-6 py-3 rounded-full font-semibold backdrop-blur-md hover:bg-opacity-30 hover:scale-105 transition-all shadow-lg"
        >
          ← Back to Home
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl animate-fade-in-up" style={{ borderRadius: '24px', padding: '48px' }}>
          {/* Header */}
          <div className="text-center mb-10">
            <div className="text-6xl mb-4">💊</div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your MedInsights account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                style={{ borderRadius: '12px' }}
                className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ borderRadius: '12px' }}
                className="w-full px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3" style={{ borderRadius: '12px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{ borderRadius: '12px' }}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Sign In
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
