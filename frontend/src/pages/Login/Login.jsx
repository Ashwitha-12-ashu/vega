import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Users,
} from 'lucide-react';
import './Login.css';

import loginIllustration from '../../assets/login-illustration.png';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/home';

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      await login(formData);

      navigate(from, {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Invalid username or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      <div className="login-shell">

        {/* =====================================================
            LEFT SIDE - VEGA BRAND / ILLUSTRATION
        ====================================================== */}

        <section className="login-visual">

          <div className="visual-content">

            <Link to="/" className="vega-brand">
              <span className="vega-brand-icon">V</span>
              <span>VEGA</span>
            </Link>

            <div className="visual-heading">
              <span className="eyebrow">
                LOCAL SERVICES, SIMPLIFIED
              </span>

              <h1>
                Find trusted
                <br />
                professionals
                <br />
                <span>near you.</span>
              </h1>

              <p>
                Discover reliable local professionals,
                compare services and book help whenever
                you need it.
              </p>
            </div>

            {/* Illustration */}

            <div className="illustration-wrapper">

              <img
                src={loginIllustration}
                alt="VEGA local service professionals"
                className="login-illustration"
              />

            </div>

            {/* Trust points */}

            <div className="trust-row">

              <div className="trust-item">
                <div className="trust-icon">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <strong>Verified</strong>
                  <span>Professionals</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon">
                  <MapPin size={17} />
                </div>

                <div>
                  <strong>Nearby</strong>
                  <span>Services</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon">
                  <Users size={17} />
                </div>

                <div>
                  <strong>Trusted</strong>
                  <span>Community</span>
                </div>
              </div>

            </div>

          </div>

          <div className="visual-glow glow-one"></div>
          <div className="visual-glow glow-two"></div>

        </section>


        {/* =====================================================
            RIGHT SIDE - LOGIN FORM
        ====================================================== */}

        <section className="login-form-side">

          <div className="login-form-container">

            <div className="mobile-brand">
              <span className="vega-brand-icon">V</span>
              <span>VEGA</span>
            </div>

            <div className="login-header">

              <div className="welcome-badge">
                Welcome back
              </div>

              <h2>
                Sign in to your account
              </h2>

              <p>
                Access your nearby services and bookings.
              </p>

            </div>


            {/* Error */}

            {error && (
              <div className="login-error">
                <span className="error-dot"></span>
                <span>{error}</span>
              </div>
            )}


            {/* Login Form */}

            <form
              className="login-form"
              onSubmit={handleSubmit}
            >

              {/* Username */}

              <div className="input-group">

                <label htmlFor="username">
                  Username or Email
                </label>

                <div className="input-wrapper">

                  <Mail
                    size={19}
                    className="input-icon"
                  />

                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username or email"
                    autoComplete="username"
                    required
                  />

                </div>

              </div>


              {/* Password */}

              <div className="input-group">

                <div className="password-label-row">

                  <label htmlFor="password">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="forgot-link"
                  >
                    Forgot password?
                  </Link>

                </div>

                <div className="input-wrapper">

                  <Lock
                    size={19}
                    className="input-icon"
                  />

                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

              </div>


              {/* Remember me */}

              <div className="login-options">

                <label className="remember-option">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                  />

                  <span className="custom-checkbox"></span>

                  <span>
                    Remember me
                  </span>

                </label>

              </div>


              {/* Submit */}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={19} />
                  </>
                )}

              </button>

            </form>


            {/* Register */}

            <div className="register-section">

              <span>
                Don't have a VEGA account?
              </span>

              <Link to="/register">
                Create an account
                <ArrowRight size={15} />
              </Link>

            </div>


            {/* Security */}

            <div className="login-security">

              <ShieldCheck size={16} />

              <span>
                Your information is securely protected.
              </span>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
};

export default Login;
