import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const value = {
    isAuthenticated,
    user,
    loading,
    logout,
    updateAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};