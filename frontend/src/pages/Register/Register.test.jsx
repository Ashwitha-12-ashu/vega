import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { authService } from '../../services/authService';

vi.mock('../../services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn().mockResolvedValue(null),
    login: vi.fn(),
    register: vi.fn().mockResolvedValue({
      user: { id: 1, username: 'johndoe', email: 'john@example.com' },
      tokens: { access: 'fake-access', refresh: 'fake-refresh' },
    }),
    logout: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('VEGA Registration Page UI and Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegister = () =>
    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter>
            <Register />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

  it('renders all registration form inputs and branding elements', () => {
    renderRegister();

    expect(screen.getByRole('heading', { name: /Create your account/i })).toBeDefined();
    expect(screen.getByPlaceholderText(/e\.g\. Ashwitha/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/e\.g\. Patel/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Choose a unique username/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/name@example\.com/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Min\. 8 characters/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Repeat password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeDefined();
  });

  it('toggles password visibility when the eye button is clicked', () => {
    renderRegister();

    const passwordInput = screen.getByPlaceholderText(/Min\. 8 characters/i);
    expect(passwordInput.getAttribute('type')).toBe('password');

    const toggleBtn = screen.getByRole('button', { name: /Show password/i });
    fireEvent.click(toggleBtn);

    expect(passwordInput.getAttribute('type')).toBe('text');
    expect(screen.getByRole('button', { name: /Hide password/i })).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /Hide password/i }));
    expect(passwordInput.getAttribute('type')).toBe('password');
  });

  it('toggles confirm password visibility independently', () => {
    renderRegister();

    const confirmPasswordInput = screen.getByPlaceholderText(/Repeat password/i);
    expect(confirmPasswordInput.getAttribute('type')).toBe('password');

    const toggleConfirmBtn = screen.getByRole('button', { name: /Show confirm password/i });
    fireEvent.click(toggleConfirmBtn);

    expect(confirmPasswordInput.getAttribute('type')).toBe('text');

    fireEvent.click(screen.getByRole('button', { name: /Hide confirm password/i }));
    expect(confirmPasswordInput.getAttribute('type')).toBe('password');
  });

  it('shows password matching indicator when confirm password is typed', () => {
    renderRegister();

    const passwordInput = screen.getByPlaceholderText(/Min\. 8 characters/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/Repeat password/i);

    fireEvent.change(passwordInput, { target: { value: 'Secret123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Different123!' } });

    expect(screen.getByText(/Mismatch/i)).toBeDefined();

    fireEvent.change(confirmPasswordInput, { target: { value: 'Secret123!' } });
    expect(screen.getByText(/Matches/i)).toBeDefined();
  });

  it('successfully submits the form and navigates to home', async () => {
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Ashwitha/i), { target: { value: 'Ashwitha' } });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Patel/i), { target: { value: 'Patel' } });
    fireEvent.change(screen.getByPlaceholderText(/Choose a unique username/i), { target: { value: 'ashupatel' } });
    fireEvent.change(screen.getByPlaceholderText(/name@example\.com/i), { target: { value: 'ashu@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Min\. 8 characters/i), { target: { value: 'Secret1234' } });
    fireEvent.change(screen.getByPlaceholderText(/Repeat password/i), { target: { value: 'Secret1234' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        first_name: 'Ashwitha',
        last_name: 'Patel',
        username: 'ashupatel',
        email: 'ashu@example.com',
        password: 'Secret1234',
        password_confirm: 'Secret1234',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
    });
  });
});
