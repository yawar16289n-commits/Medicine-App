import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg mb-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            className="text-white text-2xl font-bold hover:text-gray-100 transition-colors" 
            to={isAuthenticated ? "/sales" : "/login"}
          >
            💊 MedInsights
          </Link>
          
          {isAuthenticated && (
            <>
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-2">
                <Link 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/dashboard") 
                      ? "bg-white text-primary-600" 
                      : "text-white hover:bg-white/20"
                  }`}
                  to="/dashboard"
                >
                  Dashboard
                </Link>

                {(user?.role === "admin" || user?.role === "data_operator") && (
                  <Link 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/inventory") 
                        ? "bg-white text-primary-600" 
                        : "text-white hover:bg-white/20"
                    }`}
                    to="/inventory"
                  >
                    Inventory
                  </Link>
                )}


                <Link 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/sales") 
                      ? "bg-white text-primary-600" 
                      : "text-white hover:bg-white/20"
                  }`}
                  to="/sales"
                >
                  Sales
                </Link>

                <Link 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/weather") 
                      ? "bg-white text-primary-600" 
                      : "text-white hover:bg-white/20"
                  }`}
                  to="/weather"
                >
                  Weather
                </Link>
                {(user?.role === "admin" || user?.role === "analyst") && (
                  <Link 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/forecast") 
                        ? "bg-white text-primary-600" 
                        : "text-white hover:bg-white/20"
                    }`}
                    to="/forecast"
                  >
                    Forecast
                  </Link>
                )}
                {(user?.role === "admin" || user?.role === "data_operator") && (
                  <Link 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/master-data") 
                        ? "bg-white text-primary-600" 
                        : "text-white hover:bg-white/20"
                    }`}
                    to="/master-data"
                  >
                    Master Data
                  </Link>
                )}

                {user?.role === "admin" && (
                  <Link 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/users") 
                        ? "bg-white text-primary-600" 
                        : "text-white hover:bg-white/20"
                    }`}
                    to="/users"
                  >
                    Users
                  </Link>
                )}
                <button 
                  onClick={logout} 
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link 
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/sales") 
                  ? "bg-white text-primary-600" 
                  : "text-white hover:bg-white/20"
              }`}
              to="/sales"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sales
            </Link>
            <Link 
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/dashboard") 
                  ? "bg-white text-primary-600" 
                  : "text-white hover:bg-white/20"
              }`}
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/weather") 
                  ? "bg-white text-primary-600" 
                  : "text-white hover:bg-white/20"
              }`}
              to="/weather"
              onClick={() => setMobileMenuOpen(false)}
            >
              Weather
            </Link>
            {(user?.role === "admin" || user?.role === "analyst") && (
              <Link 
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/forecast") 
                    ? "bg-white text-primary-600" 
                    : "text-white hover:bg-white/20"
                }`}
                to="/forecast"
                onClick={() => setMobileMenuOpen(false)}
              >
                Forecast
              </Link>
            )}
            {(user?.role === "admin" || user?.role === "data_operator") && (
              <Link 
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/master-data") 
                    ? "bg-white text-primary-600" 
                    : "text-white hover:bg-white/20"
                }`}
                to="/master-data"
                onClick={() => setMobileMenuOpen(false)}
              >
                Master Data
              </Link>
            )}
            {(user?.role === "admin" || user?.role === "data_operator") && (
              <Link 
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/inventory") 
                    ? "bg-white text-primary-600" 
                    : "text-white hover:bg-white/20"
                }`}
                to="/inventory"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inventory
              </Link>
            )}
            {user?.role === "admin" && (
              <Link 
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/users") 
                    ? "bg-white text-primary-600" 
                    : "text-white hover:bg-white/20"
                }`}
                to="/users"
                onClick={() => setMobileMenuOpen(false)}
              >
                Users
              </Link>
            )}
            <button 
              onClick={() => { logout(); setMobileMenuOpen(false); }} 
              className="w-full text-left px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
