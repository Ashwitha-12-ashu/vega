import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import './ForgotPassword.css';

import { authService } from '../../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter your email or username.');
      return;
    }

    setLoading(true);

    try {
      const data = await authService.forgotPassword(trimmedEmail);

      navigate('/otp-verification', {
        state: {
          email: data.email || trimmedEmail,
          devOtp: data.otp_dev,
          purpose: 'forgot-password',
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.email?.[0] ||
        'Unable to send verification code. Please check your email and try again.'
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="forgot-page">
      {/* Decorative background elements */}
      <div className="forgot-bg-shape forgot-bg-shape-one"></div>
      <div className="forgot-bg-shape forgot-bg-shape-two"></div>

      <div className="forgot-wrapper">

        {/* Left information panel */}
        <div className="forgot-info">

          <Link to="/login" className="forgot-back-link">
            <ArrowLeft size={17} />
            Back to Login
          </Link>

          <div className="forgot-brand">
            <div className="forgot-brand-icon">
              <Sparkles size={23} />
            </div>

            <span>VEGA</span>
          </div>

          <div className="forgot-info-content">
            <div className="forgot-security-icon">
              <ShieldCheck size={38} />
            </div>

            <h1>
              Your account,
              <br />
              <span>your security.</span>
            </h1>

            <p>
              Don't worry. We'll help you securely regain access
              to your VEGA account in just a few simple steps.
            </p>

            <div className="forgot-steps">

              <div className="forgot-step active">
                <div className="forgot-step-number">1</div>

                <div>
                  <strong>Verify your email</strong>
                  <span>Tell us which account is yours</span>
                </div>
              </div>

              <div className="forgot-step-line"></div>

              <div className="forgot-step">
                <div className="forgot-step-number">2</div>

                <div>
                  <strong>Enter verification code</strong>
                  <span>We'll send a secure OTP</span>
                </div>
              </div>

              <div className="forgot-step-line"></div>

              <div className="forgot-step">
                <div className="forgot-step-number">3</div>

                <div>
                  <strong>Create new password</strong>
                  <span>Choose a new secure password</span>
                </div>
              </div>

            </div>
          </div>

          <div className="forgot-info-footer">
            <span className="forgot-footer-dot"></span>
            Secure account recovery
          </div>
        </div>

        {/* Right form panel */}
        <div className="forgot-form-panel">

          <div className="forgot-form-card">

            <div className="forgot-mobile-brand">
              <div className="forgot-brand-icon">
                <Sparkles size={20} />
              </div>

              <span>VEGA</span>
            </div>

            <div className="forgot-icon-wrapper">
              <Mail size={28} />
            </div>

            <div className="forgot-heading">
              <span className="forgot-eyebrow">
                ACCOUNT RECOVERY
              </span>

              <h2>Forgot your password?</h2>

              <p>
                Enter the email address associated with your VEGA
                account and we'll help you reset your password.
              </p>
            </div>

            {error && (
              <div className="forgot-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="forgot-input-group">

                <label htmlFor="forgot-email">
                  Email address
                </label>

                <div className="forgot-input-wrapper">

                  <Mail
                    size={18}
                    className="forgot-input-icon"
                  />

                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                  />

                </div>

              </div>

              <button
                type="submit"
                className="forgot-submit-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="forgot-spinner"></span>
                    Sending code...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight size={18} />
                  </>
                )}

              </button>

            </form>

            <div className="forgot-security-note">
              <ShieldCheck size={17} />

              <span>
                Your information is protected and will only be
                used to verify your account.
              </span>
            </div>

            <div className="forgot-login-link">
              Remember your password?
              <Link to="/login">
                Sign in
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
