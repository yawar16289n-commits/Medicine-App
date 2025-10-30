import React, { useState } from "react";

// Login component - simple dev-mode authentication
// Credentials are read from Vite env vars: VITE_DEV_USERNAME / VITE_DEV_PASSWORD
// Defaults: admin / password
function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const DEV_USER = import.meta.env.VITE_DEV_USERNAME || "admin";
  const DEV_PASS = import.meta.env.VITE_DEV_PASSWORD || "password";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === DEV_USER && password === DEV_PASS) {
      localStorage.setItem("auth", "true");
      onLogin && onLogin();
    } else {
      setError("Invalid username or password (check VITE_DEV_* env vars)");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow-sm">
            <h4 className="mb-3">Sign in</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
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
              <div className="d-grid">
                <button className="btn btn-primary" type="submit">
                  Sign in
                </button>
              </div>
            </form>
            <p className="mt-3 text-muted small">
              Dev login: <strong>{DEV_USER}</strong> / <strong>{DEV_PASS}</strong>
              (set via VITE_DEV_USERNAME / VITE_DEV_PASSWORD)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
