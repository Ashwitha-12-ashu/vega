import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Landing from '../pages/Landing/Landing';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import OTPVerification from '../pages/OTPVerification/OTPVerification';
import ResetPassword from '../pages/ResetPassword/ResetPassword';
import Home from '../pages/Home/Home';
import NearbyProviders from '../pages/NearbyProviders/NearbyProviders';
import ProviderDetails from '../pages/ProviderProfile/ProviderDetails';
import BookingFlow from '../pages/Booking/BookingFlow';
import MyBookings from '../pages/MyBookings/MyBookings';
import Profile from '../pages/Profile/Profile';
import BecomeProvider from '../pages/BecomeProvider/BecomeProvider';
import MyTalents from '../pages/MyTalents/MyTalents';
import Notifications from '../pages/Notifications/Notifications';
import ServiceDetails from '../pages/ServiceDetails/ServiceDetails';
import NotFound from '../pages/NotFound/NotFound';

import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/explore" element={<ProtectedRoute><ServiceDetails /></ProtectedRoute>} />
      <Route path="/services" element={<ProtectedRoute><ServiceDetails /></ProtectedRoute>} />
      <Route path="/bookings" element={<Navigate to="/my-bookings" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/otp-verification" element={<PublicRoute><OTPVerification /></PublicRoute>} />
      <Route path="/verify-otp" element={<PublicRoute><OTPVerification /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      <Route path="/change-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      <Route path="/nearby" element={<ProtectedRoute><NearbyProviders /></ProtectedRoute>} />
      <Route path="/providers/:id" element={<ProtectedRoute><ProviderDetails /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/become-provider" element={<ProtectedRoute><BecomeProvider /></ProtectedRoute>} />
      <Route path="/my-talents" element={<ProtectedRoute requireProvider><MyTalents /></ProtectedRoute>} />
      <Route path="/book/:talentId" element={<ProtectedRoute><BookingFlow /></ProtectedRoute>} />
      <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;