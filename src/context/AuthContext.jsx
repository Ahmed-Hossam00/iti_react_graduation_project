import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import {
  getStoredToken,
  getStoredRefreshToken,
  getStoredRememberMe,
  clearTokens,
  requestTokenRefresh,
} from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialChecked, setInitialChecked] = useState(false);

  const fetchCurrentUser = useCallback(async () => {
    let token = getStoredToken();
    const refreshToken = getStoredRefreshToken();
    const isRemembered = getStoredRememberMe();

    if (!token) {
      if (isRemembered && refreshToken) {
        try {
          token = await requestTokenRefresh();
        } catch {
          clearTokens();
          setUser(null);
          setLoading(false);
          setInitialChecked(true);
          return;
        }
      } else {
        clearTokens();
        setUser(null);
        setLoading(false);
        setInitialChecked(true);
        return;
      }
    }

    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
      setInitialChecked(true);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const handleUnauthorized = () => {
      clearTokens();
      setUser(null);
    };

    window.addEventListener('clinic:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('clinic:unauthorized', handleUnauthorized);
    };
  }, [fetchCurrentUser]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    return data;
  };

  const register = async (patientData) => {
    const data = await authApi.register(patientData);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    const refreshToken = getStoredRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    return fetchCurrentUser();
  };

  const role = user?.role || null;
  const isAuthenticated = Boolean(user);
  const isPatient = role === 'PATIENT';
  const isAssistant = role === 'ASSISTANT';
  const isDoctor = role === 'PRESCRIBER';
  const isAdmin = role === 'ADMIN';
  const isStaff = isAssistant || isDoctor || isAdmin;

  const value = {
    user,
    role,
    loading,
    initialChecked,
    isAuthenticated,
    isPatient,
    isAssistant,
    isDoctor,
    isAdmin,
    isStaff,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
