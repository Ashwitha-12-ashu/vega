import { Routes, Route } from "react-router-dom";

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
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/provider" element={<Provider />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/bookings" element={<MyBookings />} />
      <Route path="/service/:id" element={<ServiceDetails />} />
    </Routes>
  );
}

export default AppRoutes;