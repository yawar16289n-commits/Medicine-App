'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'learner' | 'instructor' | 'admin';
  bio?: string;
  profile_picture?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: {
    name: string;
    email: string;
    password: string;
    role: 'learner' | 'instructor';
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });

      if (response.success && (response.data as { success: boolean; user: Record<string, unknown> })?.success) {
        const userData = (response.data as { success: boolean; user: Record<string, unknown> }).user as unknown as User;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      }

      return {
        success: false,
        error: (response.data as { error?: string })?.error || response.error || 'Login failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  };

  const signup = async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'learner' | 'instructor';
  }) => {
    try {
      const response = await authApi.signup(userData);

      if (response.success && (response.data as { success: boolean; user: Record<string, unknown> })?.success) {
        const newUser = (response.data as { success: boolean; user: Record<string, unknown> }).user as unknown as User;
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        return { success: true };
      }

      return {
        success: false,
        error: (response.data as { error?: string })?.error || response.error || 'Signup failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
