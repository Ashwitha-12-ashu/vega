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
  LogIn,
} from 'lucide-react';
import './Register.css';

const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

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

  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [emailExistsError, setEmailExistsError] = useState(false);

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
    const name = e.target.name || e.target.id;
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error upon typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (name === 'email') {
      setEmailExistsError(false);
    }
    setGeneralError('');
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'Please enter your first name.';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Please enter your last name.';
    }

    if (!formData.username.trim()) {
      errors.username = 'Please choose a unique username.';
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters long.';
    }

    const emailTrimmed = formData.email.trim().toLowerCase();
    if (!emailTrimmed) {
      errors.email = 'Please enter a valid email address.';
    } else if (!EMAIL_REGEX.test(emailTrimmed)) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    if (!formData.password) {
      errors.password = 'Please create a password.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (!/[a-zA-Z]/.test(formData.password) || !/\d/.test(formData.password)) {
      errors.password = 'Password must contain both letters and numbers.';
    }

    if (!formData.password_confirm) {
      errors.password_confirm = 'Please confirm your password.';
    } else if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Passwords do not match.';
    }

    if (!agreedToTerms) {
      errors.terms = 'Please accept the Terms of Service and Privacy Policy to continue.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setEmailExistsError(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register({
        ...formData,
        email: formData.email.trim().toLowerCase(),
        username: formData.username.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
      });
      navigate('/home', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object' && data !== null) {
        const serverFieldErrors = {};
        let isExistingEmail = false;

        Object.entries(data).forEach(([field, msg]) => {
          const text = Array.isArray(msg) ? msg.join(' ') : String(msg);
          if (field === 'email' && text.toLowerCase().includes('already exists')) {
            isExistingEmail = true;
          }
          serverFieldErrors[field] = text;
        });

        setFieldErrors(serverFieldErrors);

        if (isExistingEmail) {
          setEmailExistsError(true);
          setGeneralError('An account with this email already exists. Please log in instead.');
        } else {
          const firstErr = Object.values(serverFieldErrors)[0];
          setGeneralError(firstErr || 'Registration failed. Please check your inputs.');
        }
      } else if (typeof data === 'string') {
        setGeneralError(data);
      } else {
        setGeneralError('Registration failed. Please check your network connection and try again.');
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

            {/* Existing Email Prompt Callout */}
            {emailExistsError && (
              <div className="existing-email-alert" role="alert">
                <div className="existing-email-icon">
                  <AlertCircle size={20} />
                </div>
                <div className="existing-email-text">
                  <strong>An account with this email already exists.</strong>
                  <p>Please log in to your existing VEGA account.</p>
                  <Link to="/login" className="existing-email-btn">
                    <LogIn size={15} /> Sign In Now
                  </Link>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {generalError && !emailExistsError && (
              <div className="register-error" role="alert">
                <div className="error-icon-wrap">
                  <AlertCircle size={18} />
                </div>
                <span>{generalError}</span>
              </div>
            )}

            {/* Form */}
            <form className="register-form" onSubmit={handleSubmit} noValidate>
              {/* Name Row: First Name & Last Name */}
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="first_name">
                    First Name <span className="required-asterisk">*</span>
                  </label>
                  <div className={`input-wrapper ${fieldErrors.first_name ? 'has-error' : ''}`}>
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
                  {fieldErrors.first_name && (
                    <span className="field-error-text">{fieldErrors.first_name}</span>
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="last_name">
                    Last Name <span className="required-asterisk">*</span>
                  </label>
                  <div className={`input-wrapper ${fieldErrors.last_name ? 'has-error' : ''}`}>
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
                  {fieldErrors.last_name && (
                    <span className="field-error-text">{fieldErrors.last_name}</span>
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="input-group">
                <label htmlFor="username">
                  Username <span className="required-asterisk">*</span>
                </label>
                <div className={`input-wrapper ${fieldErrors.username ? 'has-error' : ''}`}>
                  <User size={18} className="input-icon" />
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a unique username"
                    autoComplete="username"
                    required
                  />
                </div>
                {fieldErrors.username && (
                  <span className="field-error-text">{fieldErrors.username}</span>
                )}
              </div>

              {/* Email Address */}
              <div className="input-group">
                <label htmlFor="email">
                  Email Address <span className="required-asterisk">*</span>
                </label>
                <div className={`input-wrapper ${fieldErrors.email ? 'has-error' : ''}`}>
                  <Mail size={18} className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
                {fieldErrors.email && (
                  <span className="field-error-text">{fieldErrors.email}</span>
                )}
              </div>

              {/* Password & Confirm Password in Row */}
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="password">
                    Password <span className="required-asterisk">*</span>
                  </label>
                  <div className={`input-wrapper ${fieldErrors.password ? 'has-error' : ''}`}>
                    <Lock size={18} className="input-icon" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <span className="field-error-text">{fieldErrors.password}</span>
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="password_confirm">
                    Confirm Password <span className="required-asterisk">*</span>
                    {formData.password_confirm && (
                      <span className={`password-match-badge ${passwordStats.isMatch ? 'matched' : 'mismatched'}`}>
                        {passwordStats.isMatch ? '✓ Matches' : '✗ Mismatch'}
                      </span>
                    )}
                  </label>
                  <div className={`input-wrapper ${fieldErrors.password_confirm ? 'has-error' : ''}`}>
                    <Lock size={18} className="input-icon" />
                    <input
                      id="password_confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="password_confirm"
                      value={formData.password_confirm}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.password_confirm && (
                    <span className="field-error-text">{fieldErrors.password_confirm}</span>
                  )}
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
                {fieldErrors.terms && (
                  <span className="field-error-text" style={{ display: 'block', marginTop: '4px' }}>
                    {fieldErrors.terms}
                  </span>
                )}
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
