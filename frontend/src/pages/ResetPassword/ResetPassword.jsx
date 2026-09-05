import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

import './ResetPassword.css';

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const stateEmail = location.state?.email || '';
  const otp = location.state?.otp || '';

  const [email, setEmail] = useState(stateEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[A-Za-z]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    const targetEmail = (email || stateEmail).trim();
    if (!targetEmail) {
      setError('Please enter your email or username.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (!hasNumber || !hasLetter) {
      setError('Password must contain letters and numbers.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        email: targetEmail,
        otp,
        password,
        confirm_password: confirmPassword,
      });

      setSuccess(true);

      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 1200);

    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.confirm_password?.[0] ||
        'Unable to reset password. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-page">
        <div className="reset-card success-card">
          <div className="success-icon">
            <CheckCircle2 size={38} />
          </div>

          <h1>Password updated!</h1>

          <p>
            Your VEGA password has been reset successfully. You are now logged in!
          </p>

          <button
            type="button"
            className="reset-button"
            onClick={() => navigate('/home', { replace: true })}
            style={{ marginTop: '1.25rem' }}
          >
            <span>Open VEGA Home</span>
            <ArrowRight size={18} />
          </button>

          <span className="redirect-message" style={{ marginTop: '1rem', display: 'block' }}>
            Opening your dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-page">
      <div className="reset-card">
        <div className="reset-icon">
          <Lock size={28} />
        </div>

        <div className="reset-header">
          <span>PASSWORD RESET</span>
          <h1>Create a new password</h1>
          <p>
            Choose a strong password for your VEGA account.
          </p>
          {stateEmail && (
            <strong style={{ color: '#0284c7', display: 'block', marginTop: '0.25rem' }}>
              {stateEmail}
            </strong>
          )}
        </div>


        {error && (
          <div className="reset-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* EMAIL (if not passed from previous step) */}
          {!stateEmail && (
            <div className="reset-input-group">
              <label>Email or Username</label>
              <div className="reset-input-wrapper">
                <Mail size={18} />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email or username"
                  required
                />
              </div>
            </div>
          )}

          {/* NEW PASSWORD */}

          <div className="reset-input-group">

            <label>
              New password
            </label>

            <div className="reset-input-wrapper">

              <Lock size={18} />


              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter new password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="reset-eye"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          {/* PASSWORD REQUIREMENTS */}

          <div className="password-requirements">

            <p>Password requirements</p>

            <div className={
              passwordLength
                ? 'requirement valid'
                : 'requirement'
            }>
              <CheckCircle2 size={14} />
              At least 8 characters
            </div>

            <div className={
              hasLetter
                ? 'requirement valid'
                : 'requirement'
            }>
              <CheckCircle2 size={14} />
              Contains a letter
            </div>

            <div className={
              hasNumber
                ? 'requirement valid'
                : 'requirement'
            }>
              <CheckCircle2 size={14} />
              Contains a number
            </div>

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="reset-input-group">

            <label>
              Confirm new password
            </label>

            <div className="reset-input-wrapper">

              <Lock size={18} />

              <input
                type={
                  showConfirmPassword
                    ? 'text'
                    : 'password'
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Re-enter new password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="reset-eye"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          <button
            type="submit"
            className="reset-button"
            disabled={loading}
          >

            {loading
              ? 'Updating password...'
              : 'Update password'}

            {!loading && (
              <ArrowRight size={18} />
            )}

          </button>

        </form>

        <div className="reset-security">

          <ShieldCheck size={15} />

          <span>
            Your password is securely protected.
          </span>

        </div>

        <Link
          to="/login"
          className="back-login"
        >
          Back to login
        </Link>

      </div>

    </div>
  );
};

export default ResetPassword;
