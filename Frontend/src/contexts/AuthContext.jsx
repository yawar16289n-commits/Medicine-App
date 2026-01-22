import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function getRoleFromToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded.role;
  } catch (e) {
    return null;
  }
}

function getUsernameFromToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded.sub;
  } catch (e) {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };

  const updateAuthState = () => {
    const token = localStorage.getItem("token");
    
    if (token) {
      const role = getRoleFromToken(token);
      const username = getUsernameFromToken(token);
      
      if (role && username) {
        localStorage.setItem("role", role);
        localStorage.setItem("username", username);
        setUser({ username, role });
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    updateAuthState();
    setLoading(false);
  }, []);

  // Permission helpers - centralized role checking
  const permissions = {
    // Can create, update, delete data (admin, data_operator)
    canModifyData: user?.role === 'admin' || user?.role === 'data_operator',
    // Can view and generate reports (admin, analyst)
    canViewReports: user?.role === 'admin' || user?.role === 'analyst',
    // Can manage users (admin only)
    canManageUsers: user?.role === 'admin',
    // Can view forecasts (all authenticated users)
    canViewForecasts: !!user,
    // Can upload data (admin, data_operator)
    canUploadData: user?.role === 'admin' || user?.role === 'data_operator',
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    logout,
    updateAuthState,
    permissions, // Expose permission helpers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};