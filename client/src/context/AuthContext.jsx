import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('beyond_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('beyond_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [diagnostics, setDiagnostics] = useState(null);

  const fetchDiagnostics = async () => {
    try {
      const res = await authAPI.getConfigStatus();
      if (res.data?.success) {
        setDiagnostics(res.data.diagnostics);
      }
    } catch (err) {
      console.warn('Could not fetch config diagnostics:', err.message);
    }
  };

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authAPI.getMe();
      if (res.data?.success) {
        setUser(res.data.user);
        localStorage.setItem('beyond_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Session expired or invalid:', err.message);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
    refreshUser();
  }, [token]);

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('beyond_token', newToken);
    localStorage.setItem('beyond_user', JSON.stringify(newUser));
  };

  const requestSignupOTP = async ({ name, email, password }) => {
    setIsLoading(true);
    try {
      const res = await authAPI.requestSignupOTP({ name, email, password });
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to send verification code.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTPAndRegister = async ({ email, otpCode }) => {
    setIsLoading(true);
    try {
      const res = await authAPI.verifyOTPAndRegister({ email, otpCode });
      if (res.data?.success) {
        handleAuthSuccess(res.data.token, res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data?.message || 'Verification failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Verification failed. Please check the code.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPassword = async ({ email, password }) => {
    setIsLoading(true);
    try {
      const res = await authAPI.loginWithPassword({ email, password });
      if (res.data?.success) {
        handleAuthSuccess(res.data.token, res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data?.message || 'Login failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid email or password.',
        needsVerification: err.response?.data?.needsVerification,
        email: err.response?.data?.email
      };
    } finally {
      setIsLoading(false);
    }
  };

  const adminQuickLogin = async () => {
    setIsLoading(true);
    try {
      const res = await authAPI.adminQuickLogin();
      if (res.data?.success) {
        handleAuthSuccess(res.data.token, res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Admin login failed.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credential) => {
    setIsLoading(true);
    try {
      const res = await authAPI.googleAuth(credential);
      if (res.data?.success) {
        handleAuthSuccess(res.data.token, res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data?.message || 'Google login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Google authentication error',
        diagnostics: err.response?.data?.diagnostics
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('beyond_token');
    localStorage.removeItem('beyond_user');
  };

  const updateLocalUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('beyond_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        diagnostics,
        requestSignupOTP,
        verifyOTPAndRegister,
        loginWithPassword,
        adminQuickLogin,
        loginWithGoogle,
        logout,
        updateLocalUser,
        refreshUser,
        fetchDiagnostics
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
