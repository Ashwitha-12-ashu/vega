import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadCurrentUser = async () => {
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
      console.error('Failed to load user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

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
