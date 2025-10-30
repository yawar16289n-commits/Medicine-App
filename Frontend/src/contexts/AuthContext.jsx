import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';

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
    const mock = localStorage.getItem("auth") === "true";
    
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
    } else if (mock) {
      const role = localStorage.getItem("role") || "user";
      const username = localStorage.getItem("username") || "mock-user";
      setUser({ username, role });
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    updateAuthState();
    setLoading(false);
  }, []);

  // Set up axios interceptor to handle 401 responses
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && isAuthenticated) {
          // Only logout for specific token-related errors, not generic auth failures
          const errorMessage = error.response?.data?.error || '';
          if (errorMessage === 'token expired' || 
              errorMessage === 'invalid token' || 
              errorMessage === 'token required') {
            logout();
          }
          // For 'authentication required' or other generic errors, let components handle them
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [isAuthenticated]);

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