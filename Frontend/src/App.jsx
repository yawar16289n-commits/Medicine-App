import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";

// Lazy load page components for code splitting
const Home = lazy(() => import("./pages/Home"));
const SalesPage = lazy(() => import("./pages/SalesPage"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const ForecastPage = lazy(() => import("./pages/ForecastPage"));
const ForecastDetailPage = lazy(() => import("./pages/ForecastDetailPage"));
const WeatherAnalytics = lazy(() => import("./pages/WeatherAnalytics"));
const DistrictManager = lazy(() => import("./pages/DistrictManager"));
const FormulaManager = lazy(() => import("./pages/FormulaManager"));
const MedicineManager = lazy(() => import("./pages/MedicineManager"));
const MasterDataPage = lazy(() => import("./pages/MasterDataPage"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const ActivitiesPage = lazy(() => import("./pages/ActivitiesPage"));
const Infographic = lazy(() => import("./pages/Infographic"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

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
  const hideNavbarOnPaths = ['/login', '/', '/infographic'];
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
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </AppLayout>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
