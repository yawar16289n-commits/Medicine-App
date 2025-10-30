import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import MedicinesPage from "./pages/MedicinesPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import UserProfile from "./pages/UserProfile";

function getRoleFromToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded.role;
  } catch (e) {
    return null;
  }
}

function RequireAuth({ children, allowedRoles = null }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const mock = localStorage.getItem("auth") === "true";

  let role = localStorage.getItem("role");
  if (!role && token) {
    role = getRoleFromToken(token);
    if (role) localStorage.setItem("role", role);
  }

  const authed = !!token || mock;

  if (!authed) {
    // remember where the user wanted to go
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // authenticated but not authorized for this route - send to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/medicines" element={
          <RequireAuth>
            <MedicinesPage />
          </RequireAuth>
        } />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/users" element={
          <RequireAuth allowedRoles={["admin"]}>
            <UserManagement />
          </RequireAuth>
        } />
        <Route path="/profile" element={
          <RequireAuth>
            <UserProfile />
          </RequireAuth>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
