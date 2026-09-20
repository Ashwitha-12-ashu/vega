import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Briefcase,
  Check,
  X,
} from 'lucide-react';
import './Register.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password validation analysis
  const passwordStats = useMemo(() => {
    const pwd = formData.password;
    const confirm = formData.password_confirm;

    const hasMinLength = pwd.length >= 8;
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);

    let score = 0;
    if (hasMinLength) score++;
    if (hasLetters && hasNumbers) score++;
    if (hasSpecial || pwd.length >= 12) score++;

    let strength = 'weak';
    if (score === 2) strength = 'medium';
    if (score >= 3) strength = 'strong';

    const isMatch = confirm ? pwd === confirm : null;

    return {
      hasMinLength,
      hasLettersAndNumbers: hasLetters && hasNumbers,
      isMatch,
      strength: pwd.length > 0 ? strength : '',
    };
  }, [formData.password, formData.password_confirm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/home', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object' && data !== null) {
        // Collect all DRF validation error messages cleanly
        const errorMessages = Object.entries(data).map(([field, msg]) => {
          const formattedField = field.replace('_', ' ');
          const text = Array.isArray(msg) ? msg.join(' ') : String(msg);
          return `${formattedField.charAt(0).toUpperCase() + formattedField.slice(1)}: ${text}`;
        });
        setError(errorMessages.join(' | ') || 'Registration failed. Please check your inputs.');
      } else if (typeof data === 'string') {
        setError(data);
      } else {
        setError('Registration failed. Please check your network connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="register-shell">
        {/* =====================================================
            LEFT SIDE - VEGA BRAND / VISUAL HIGHLIGHTS
        ====================================================== */}
        <section className="register-visual">
          <div>
            <Link to="/" className="vega-brand">
              <span className="vega-brand-icon">V</span>
              <span>VEGA</span>
            </Link>

            <div className="visual-heading">
              <div className="eyebrow">
                <Sparkles size={13} />
                <span>JOIN THE VEGA PLATFORM</span>
              </div>

              <h1>
                One Account.
                <br />
                Endless Local
                <br />
                <span>Possibilities.</span>
              </h1>

              <p>
                Discover top-rated local professionals near you, or activate Provider Mode
                in one click to showcase your talents and accept bookings.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="register-features">
              <div className="register-feature-card">
                <div className="register-feature-icon">
                  <MapPin size={18} />
                </div>
                <div className="register-feature-info">
                  <strong>Instant Proximity Discovery</strong>
                  <span>Find verified service experts within a 1km to 20km radius.</span>
                </div>
              </div>

              <div className="register-feature-card">
                <div className="register-feature-icon">
                  <Briefcase size={18} />
                </div>
                <div className="register-feature-info">
                  <strong>Single Unified Account</strong>
                  <span>Switch seamlessly between booking services and offering your talents.</span>
                </div>
              </div>

              <div className="register-feature-card">
                <div className="register-feature-icon">
                  <ShieldCheck size={18} />
                </div>
                <div className="register-feature-info">
                  <strong>Verified Ratings & Reviews</strong>
                  <span>Authentic customer reviews only from verified completed bookings.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Row */}
          <div className="trust-row">
            <div className="trust-item">
              <div className="trust-icon">
                <Sparkles size={16} />
              </div>
              <div>
                <strong>Free Setup</strong>
                <span>Zero signup fees</span>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon">
                <ShieldCheck size={16} />
              </div>
              <div>
                <strong>Safe & Secure</strong>
                <span>Encrypted data</span>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <strong>Instant Start</strong>
                <span>Book right away</span>
              </div>
            </div>
          </div>

          {/* Background glowing orbs */}
          <div className="visual-glow glow-one"></div>
          <div className="visual-glow glow-two"></div>
        </section>

        {/* =====================================================
            RIGHT SIDE - REGISTRATION FORM
        ====================================================== */}
        <section className="register-form-side">
          <div className="register-form-container">
            {/* Mobile Brand */}
            <div className="mobile-brand">
              <span className="vega-brand-icon">V</span>
              <span>VEGA</span>
            </div>

            {/* Header */}
            <div className="register-header">
              <div className="welcome-badge">
                <Sparkles size={13} />
                <span>Join VEGA Community</span>
              </div>
              <h2>Create your account</h2>
              <p>Sign up in under a minute to discover local pros or offer your skills.</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="register-error" role="alert">
                <div className="error-icon-wrap">
                  <AlertCircle size={18} />
                </div>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form className="register-form" onSubmit={handleSubmit}>
              {/* Name Row: First Name & Last Name */}
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="first_name">First Name</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      id="first_name"
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="e.g. Ashwitha"
                      autoComplete="given-name"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="last_name">Last Name</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      id="last_name"
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="e.g. Patel"
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>
              </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Ashwitha"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="kama"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="janedoe"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 chars"
                className="form-input"
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                placeholder="Repeat password"
                className="form-input"
                required
              />
            </div>
          </div>

              {/* Password Strength & Live Helpers */}
              {formData.password && (
                <div className="password-strength-container">
                  <div className="strength-bar-track">
                    <div
                      className={`strength-bar-fill ${passwordStats.strength}`}
                    ></div>
                  </div>
                  <div className="password-hints">
                    <span
                      className={`password-hint-item ${
                        passwordStats.hasMinLength ? 'valid' : ''
                      }`}
                    >
                      {passwordStats.hasMinLength ? <Check size={12} /> : <X size={12} />}
                      8+ characters
                    </span>
                    <span
                      className={`password-hint-item ${
                        passwordStats.hasLettersAndNumbers ? 'valid' : ''
                      }`}
                    >
                      {passwordStats.hasLettersAndNumbers ? <Check size={12} /> : <X size={12} />}
                      Letters & numbers
                    </span>
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="terms-row">
                <label className="terms-label">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <span className="custom-checkbox"></span>
                  <span>
                    I agree to VEGA's{' '}
                    <span className="terms-link">Terms of Service</span> and{' '}
                    <span className="terms-link">Privacy Policy</span>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Sign In */}
            <div className="signin-section">
              <span>Already have a VEGA account?</span>
              <Link to="/login">
                Sign in to your account
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Security Badge */}
            <div className="register-security">
              <ShieldCheck size={15} />
              <span>256-bit SSL encrypted • Instant activation</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Register;
