import OTPVerification from './pages/OTPVerification/OTPVerification';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

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
import NotFound from './pages/NotFound/NotFound';

import './index.css';


function AppRoutes() {
  const { pathname } = useLocation();

  const isLandingPage = pathname === '/';

  return (
    <div className="app-container">

      {/* Navbar should not appear on landing page */}
      {!isLandingPage && <Navbar />}

      <main className="main-content">

        <Routes>

          {/* Landing */}
          <Route
            path="/"
            element={<Landing />}
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

          {/* Keep old URL working */}
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Authentication */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/otp-verification"
            element={<OTPVerification />}
          />
          <Route
            path="/verify-otp"
            element={<OTPVerification />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />
          <Route
            path="/change-password"
            element={<ResetPassword />}
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
