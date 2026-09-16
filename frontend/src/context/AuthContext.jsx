import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

const getStoredUser = () => {
  const token = localStorage.getItem('vega_access_token');
  const savedUser = localStorage.getItem('vega_user');
  if (token && savedUser) {
    try {
      return JSON.parse(savedUser);
    } catch (e) {
      console.warn('Failed to parse cached vega_user from localStorage:', e);
      return null;
    }
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  // Synchronous initialization so session is available immediately without flicker
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(() => {
    // If a token exists, we start loading=true while we verify the token with backend
    return Boolean(localStorage.getItem('vega_access_token'));
  });
  const { showToast } = useToast();

  const loadCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('vega_access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.warn('Backend user validation result:', err?.response?.status || err.message);
      // Only nuke session if the server explicitly rejected the token (401 Unauthorized / 403 Forbidden)
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('vega_access_token');
        localStorage.removeItem('vega_refresh_token');
        localStorage.removeItem('vega_user');
        setUser(null);
      } else {
        // If it was a network error / offline, retain the cached user from localStorage
        const cached = getStoredUser();
        if (cached) {
          setUser(cached);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();

    // Multi-tab session synchronization listener
    const handleStorageChange = (event) => {
      if (
        event.key === 'vega_access_token' ||
        event.key === 'vega_user' ||
        event.key === 'vega_refresh_token'
      ) {
        const token = localStorage.getItem('vega_access_token');
        const storedUser = getStoredUser();
        if (token && storedUser) {
          setUser(storedUser);
        } else if (!token) {
          setUser(null);
        }
      }
    };

    // Session expired event from axios interceptor
    const handleSessionExpired = () => {
      setUser(null);
      showToast('Your session has expired. Please sign in again.', 'warning');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('vega_session_expired', handleSessionExpired);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('vega_session_expired', handleSessionExpired);
    };
  }, [loadCurrentUser, showToast]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    showToast(`Welcome back, ${data.user.first_name || data.user.username}!`, 'success');
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    showToast('Account created successfully! Welcome to VEGA.', 'success');
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    showToast('Logged out successfully.', 'info');
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  const updateProfile = async (profileData) => {
    const data = await profileService.updateProfile(profileData);
    await refreshUser();
    showToast('Profile updated successfully!', 'success');
    return data;
  };

  const removeProfilePhoto = async () => {
    const data = await profileService.removeProfilePhoto();
    await refreshUser();
    showToast('Profile photo removed successfully.', 'info');
    return data;
  };

  const enableProviderMode = async (enable = true) => {
    const data = await profileService.enableProvider(enable);
    await refreshUser();
    showToast(data.message, 'success');
    return data;
  };

  const goOnline = async () => {
    try {
      const data = await profileService.goOnline();
      await refreshUser();
      showToast('You are now ONLINE and discoverable by nearby customers.', 'success');
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to go online.';
      showToast(errorMsg, 'error');
      throw err;
    }
  };

  const goOffline = async () => {
    try {
      const data = await profileService.goOffline();
      await refreshUser();
      showToast('You are now OFFLINE.', 'info');
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to go offline.';
      showToast(errorMsg, 'error');
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  const verifyOTP = async (email, otp) => {
    return await authService.verifyOTP(email, otp);
  };

  const resetPassword = async (resetData) => {
    const data = await authService.resetPassword(resetData);
    if (data.user) {
      setUser(data.user);
      showToast(`Password updated! Welcome back, ${data.user.first_name || data.user.username}!`, 'success');
    }
    return data;
  };

  const isProvider = Boolean(user?.profile?.is_provider);
  const isOnline = Boolean(user?.profile?.is_online);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isProvider,
        isOnline,
        login,
        register,
        logout,
        refreshUser,
        forgotPassword,
        verifyOTP,
        resetPassword,
        updateProfile,
        removeProfilePhoto,
        enableProviderMode,
        goOnline,
        goOffline,
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
