import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  MapPin,
  CalendarDays,
  User,
  LogOut,
  Menu,
  X,
  Power,
} from "lucide-react";
import { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="vega-navbar">
      <div className="navbar-inner">

        {/* LOGO */}
        <Link to="/home" className="vega-logo" onClick={() => setMenuOpen(false)}>
          <div className="logo-icon">V</div>
          <div className="logo-text">
            <strong>VEGA</strong>
            <span>LOCAL SERVICES</span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className={`navbar-links ${menuOpen ? "mobile-open" : ""}`}>

          <Link
            to="/home"
            className={isActive("/home") ? "nav-link active" : "nav-link"}
            onClick={() => setMenuOpen(false)}
          >
            <Home size={18} />
            <span>Home</span>
          </Link>

          <Link
            to="/home#services"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            <Search size={18} />
            <span>Services</span>
          </Link>

          <Link
            to="/home#nearby"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            <MapPin size={18} />
            <span>Nearby Pros</span>
          </Link>

          <Link
            to="/bookings"
            className={isActive("/bookings") ? "nav-link active" : "nav-link"}
            onClick={() => setMenuOpen(false)}
          >
            <CalendarDays size={18} />
            <span>Bookings</span>
          </Link>

          <Link
            to="/profile"
            className={isActive("/profile") ? "nav-link active" : "nav-link"}
            onClick={() => setMenuOpen(false)}
          >
            <User size={18} />
            <span>Profile</span>
          </Link>

          <button className="mobile-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </nav>

        {/* ONLINE STATUS */}
        <div className="navbar-right">
          <div className="online-status">
            <span className="online-dot"></span>
            <span>ONLINE</span>
            <Power size={15} />
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={17} />
          </button>

          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>
    </header>
  );
}

export default Navbar;