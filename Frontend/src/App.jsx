import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import MedicinesPage from "./pages/MedicinesPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import UserProfile from "./pages/UserProfile";

function RequireAuth({ children, allowedRoles = null }) {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="container mt-4"><p>Loading...</p></div>;
  }

  if (!isAuthenticated) {
    // remember where the user wanted to go
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // authenticated but not authorized for this route - send to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;
