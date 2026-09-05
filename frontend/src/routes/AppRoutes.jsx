import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Home from "../pages/Home/Home";
import Profile from "../pages/Profile/Profile";
import Provider from "../pages/Provider/Provider";
import Booking from "../pages/Booking/Booking";
import MyBookings from "../pages/MyBookings/MyBookings";
import ServiceDetails from "../pages/ServiceDetails/ServiceDetails";

function AppRoutes() {
  return (
    <Routes>

      {/* Public landing page */}
      <Route path="/" element={<Landing />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main VEGA Home */}
      <Route path="/home" element={<Home />} />

      {/* IMPORTANT:
          Login currently redirects to /explore.
          Keep /explore pointing to the same Home page.
      */}
      <Route path="/explore" element={<Home />} />

      {/* Profile */}
      <Route path="/profile" element={<Profile />} />

      {/* Provider */}
      <Route path="/provider" element={<Provider />} />

      {/* Booking */}
      <Route path="/booking" element={<Booking />} />

      {/* My Bookings */}
      <Route path="/bookings" element={<MyBookings />} />

      {/* Service details */}
      <Route path="/service/:id" element={<ServiceDetails />} />

      {/* Unknown URL → Home */}
      <Route path="*" element={<Navigate to="/home" replace />} />

    </Routes>
  );
}

export default AppRoutes;