import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SalesPage from "./pages/SalesPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import ForecastPage from "./pages/ForecastPage";
import ForecastDetailPage from "./pages/ForecastDetailPage";
import WeatherAnalytics from "./pages/WeatherAnalytics";
import DistrictManager from "./pages/DistrictManager";
import FormulaManager from "./pages/FormulaManager";
import MedicineManager from "./pages/MedicineManager";
import MasterDataPage from "./pages/MasterDataPage";
import InventoryPage from "./pages/InventoryPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import Infographic from "./pages/Infographic";

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

function AppLayout({ children }) {
  const location = useLocation();
  const hideNavbarOnPaths = ['/login', '/'];
  const shouldShowNavbar = !hideNavbarOnPaths.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      {children}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/infographic" element={<Infographic />} />
          <Route path="/sales" element={
            <RequireAuth>
              <SalesPage />
            </RequireAuth>
          } />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/users" element={
            <RequireAuth allowedRoles={["admin"]}>
              <UserManagement />
            </RequireAuth>
          } />
          <Route path="/forecast" element={
            <RequireAuth allowedRoles={["admin", "analyst"]}>
              <ForecastPage />
            </RequireAuth>
          } />
          <Route path="/forecast/:districtName/:formulaName" element={
            <RequireAuth allowedRoles={["admin", "analyst"]}>
              <ForecastDetailPage />
            </RequireAuth>
          } />
          <Route path="/weather" element={
            <RequireAuth>
              <WeatherAnalytics />
            </RequireAuth>
          } />
          <Route path="/master-data" element={
            <RequireAuth allowedRoles={["admin", "data_operator"]}>
              <MasterDataPage />
            </RequireAuth>
          } />
          <Route path="/districts" element={
            <RequireAuth allowedRoles={["admin"]}>
              <DistrictManager />
            </RequireAuth>
          } />
          <Route path="/formulas" element={
            <RequireAuth allowedRoles={["admin", "data_operator"]}>
              <FormulaManager />
            </RequireAuth>
          } />
          <Route path="/manage-medicines" element={
            <RequireAuth allowedRoles={["admin", "data_operator"]}>
              <MedicineManager />
            </RequireAuth>
          } />
          <Route path="/inventory" element={
            <RequireAuth allowedRoles={["admin", "data_operator"]}>
              <InventoryPage />
            </RequireAuth>
          } />
          <Route path="/activities" element={
            <RequireAuth>
              <ActivitiesPage />
            </RequireAuth>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
