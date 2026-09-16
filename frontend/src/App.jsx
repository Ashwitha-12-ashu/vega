import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

import OTPVerification from './pages/OTPVerification/OTPVerification';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';

import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import NearbyProviders from './pages/NearbyProviders/NearbyProviders';
import ProviderDetails from './pages/ProviderProfile/ProviderDetails';
import BookingFlow from './pages/Booking/BookingFlow';
import MyBookings from './pages/MyBookings/MyBookings';
import Profile from './pages/Profile/Profile';
import BecomeProvider from './pages/BecomeProvider/BecomeProvider';
import MyTalents from './pages/MyTalents/MyTalents';
import Notifications from './pages/Notifications/Notifications';
import ServiceDetails from './pages/ServiceDetails/ServiceDetails';
import NotFound from './pages/NotFound/NotFound';

import './index.css';


function AppRoutes() {
  const { pathname } = useLocation();
  const { isAuthenticated, loading } = useAuth();

  const isLandingPage = pathname === '/' && !isAuthenticated;

  return (
    <div className="app-container">

      {/* Navbar appears everywhere except for unauthenticated landing page */}
      {!isLandingPage && <Navbar />}

      <main className="main-content">

        <Routes>

          {/* Landing / Root - Redirect to /home if authenticated */}
          <Route
            path="/"
            element={
              !loading && isAuthenticated ? (
                <Navigate to="/home" replace />
              ) : (
                <Landing />
              )
            }
          />

          {/* MAIN HOME PAGE */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Services / Explore Directory */}
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <ServiceDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <ServiceDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings"
            element={<Navigate to="/my-bookings" replace />}
          />

          {/* Authentication (Guest-only routes) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          <Route
            path="/otp-verification"
            element={
              <PublicRoute>
                <OTPVerification />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <PublicRoute>
                <OTPVerification />
              </PublicRoute>
            }
          />

          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          {/* Nearby Providers */}
          <Route
            path="/nearby"
            element={
              <ProtectedRoute>
                <NearbyProviders />
              </ProtectedRoute>
            }
          />

          {/* Provider Profile */}
          <Route
            path="/providers/:id"
            element={
              <ProtectedRoute>
                <ProviderDetails />
              </ProtectedRoute>
            }
          />

          {/* User Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Become Provider */}
          <Route
            path="/become-provider"
            element={
              <ProtectedRoute>
                <BecomeProvider />
              </ProtectedRoute>
            }
          />

          {/* Provider Talents */}
          <Route
            path="/my-talents"
            element={
              <ProtectedRoute requireProvider>
                <MyTalents />
              </ProtectedRoute>
            }
          />

          {/* Booking */}
          <Route
            path="/book/:talentId"
            element={
              <ProtectedRoute>
                <BookingFlow />
              </ProtectedRoute>
            }
          />

          {/* My Bookings */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>

      </main>

      {!isLandingPage && <Footer />}

    </div>
  );
}


export default function App() {
  return (
    <ToastProvider>

      <AuthProvider>

        <LocationProvider>

          <Router>

            <AppRoutes />

          </Router>

        </LocationProvider>

      </AuthProvider>

    </ToastProvider>
  );
}
