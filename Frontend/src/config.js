// Centralized API endpoints for the frontend
// Change API_BASE for different backend hosts (dev, staging, prod)
// Vite exposes env vars on import.meta.env and requires the VITE_ prefix for user-defined vars.
export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";
export const MEDICINES_API = `${API_BASE}/api/medicines`;
