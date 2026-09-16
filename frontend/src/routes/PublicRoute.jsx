import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PublicRoute restricts access to guest-only pages (e.g. Login, Register, Forgot Password).
 * If the user is already authenticated, they are automatically redirected to /home.
 */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || '/home';
    return <Navigate to={destination} replace />;
  }

  return children;
};

export default PublicRoute;
