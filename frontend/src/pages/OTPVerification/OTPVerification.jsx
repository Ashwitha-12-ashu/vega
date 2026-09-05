import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

import './OTPVerification.css';

import { authService } from '../../services/authService';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';
  const initialDevOtp = location.state?.devOtp || '';

  const [otp, setOtp] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    if (initialDevOtp && initialDevOtp.length === 6) {
      const digits = initialDevOtp.split('');
      setOtp(digits);
    }
  }, [initialDevOtp]);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (
      e.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!pasted) return;

    const newOtp = [...otp];

    pasted.split('').forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    inputRefs.current[
      Math.min(pasted.length, 5)
    ]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (email) {
        await authService.verifyOTP(email, otpValue);
      }

      navigate('/reset-password', {
        state: {
          email,
          otp: otpValue,
        },
      });

    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Invalid or expired OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setError('');
    setResendMsg('');

    try {
      const data = await authService.forgotPassword(email);
      if (data.otp_dev) {
        setOtp(data.otp_dev.split(''));
      }
      setResendMsg('New verification code sent!');
      setTimer(60);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP.');
    }
  };


  return (
    <div className="otp-page">

      <div className="otp-card">

        <Link
          to="/forgot-password"
          className="otp-back"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <div className="otp-icon">
          <ShieldCheck size={30} />
        </div>

        <div className="otp-header">

          <span>SECURITY VERIFICATION</span>

          <h1>Verify your email</h1>

          <p>
            We've sent a 6-digit verification code to
          </p>

          <strong>
            {email || 'your email address'}
          </strong>

        </div>

        {error && (
          <div className="otp-error">
            {error}
          </div>
        )}

        {resendMsg && !error && (
          <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '16px', textAlign: 'center' }}>
            {resendMsg}
          </div>
        )}


        <form onSubmit={handleVerify}>

          <div
            className="otp-inputs"
            onPaste={handlePaste}
          >

            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleChange(
                    e.target.value,
                    index
                  )
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, index)
                }
                className="otp-input"
              />
            ))}

          </div>

          <button
            type="submit"
            className="otp-verify-button"
            disabled={loading}
          >
            {loading
              ? 'Verifying...'
              : 'Verify code'}

            {!loading && (
              <ArrowRight size={18} />
            )}
          </button>

        </form>

        <div className="otp-resend">

          {timer > 0 ? (
            <p>
              Didn't receive the code?
              <span>
                Resend in {timer}s
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
            >
              <RotateCcw size={15} />
              Resend verification code
            </button>
          )}

        </div>

        <div className="otp-security">

          <ShieldCheck size={15} />

          <span>
            This verification helps keep your
            VEGA account secure.
          </span>

        </div>

      </div>

    </div>
  );
};

export default OTPVerification;
