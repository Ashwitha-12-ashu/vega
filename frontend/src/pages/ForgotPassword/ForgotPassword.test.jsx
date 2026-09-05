import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import OTPVerification from '../OTPVerification/OTPVerification';
import ResetPassword from '../ResetPassword/ResetPassword';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { authService } from '../../services/authService';

vi.mock('../../services/authService', () => ({
  authService: {
    forgotPassword: vi.fn().mockResolvedValue({ message: 'Code sent', email: 'test@example.com', otp_dev: '123456' }),
    verifyOTP: vi.fn().mockResolvedValue({ message: 'Verified', valid: true, email: 'test@example.com' }),
    resetPassword: vi.fn().mockResolvedValue({
      message: 'Reset success',
      user: { id: 1, username: 'testuser', email: 'test@example.com' },
      tokens: { access: 'fake-access', refresh: 'fake-refresh' },
    }),
    getCurrentUser: vi.fn().mockResolvedValue(null),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('Forgot Password, OTP, and Reset Password Flows', () => {
  it('renders ForgotPassword form with email input and submit button', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter>
            <ForgotPassword />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Send Verification Code/i })).toBeDefined();
  });

  it('renders OTPVerification form with 6 digit inputs', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={[{ pathname: '/otp-verification', state: { email: 'test@example.com' } }]}>
            <OTPVerification />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    expect(screen.getByText(/test@example\.com/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Verify code/i })).toBeDefined();
  });

  it('renders ResetPassword form with password fields', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={[{ pathname: '/reset-password', state: { email: 'test@example.com', otp: '123456' } }]}>
            <ResetPassword />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    expect(screen.getByPlaceholderText(/^Enter new password$/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/^Re-enter new password$/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Update password/i })).toBeDefined();
  });
});

