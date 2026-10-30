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
    register: vi.fn(),
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

describe('VEGA Registration Page UI, Validation and Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authService.register.mockResolvedValue({
      user: { id: 1, username: 'johndoe', email: 'john@example.com' },
      tokens: { access: 'fake-access', refresh: 'fake-refresh' },
    });
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

  it('renders all registration form inputs with visible mandatory asterisks', () => {
    renderRegister();

    expect(screen.getByRole('heading', { name: /Create your account/i })).toBeDefined();
    expect(screen.getByText(/First Name/i)).toBeDefined();
    expect(screen.getByText(/Last Name/i)).toBeDefined();
    expect(screen.getByText(/Username/i)).toBeDefined();
    expect(screen.getByText(/Email Address/i)).toBeDefined();
    expect(screen.getByText(/Confirm Password/i)).toBeDefined();

    // Check visible asterisks
    const asterisks = screen.getAllByText('*');
    expect(asterisks.length).toBeGreaterThanOrEqual(5);
  });

  it('validates and rejects obviously invalid email formats like abc or test@', async () => {
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Ashwitha/i), { target: { value: 'Ashwitha' } });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Patel/i), { target: { value: 'Patel' } });
    fireEvent.change(screen.getByPlaceholderText(/Choose a unique username/i), { target: { value: 'ashupatel' } });
    fireEvent.change(screen.getByPlaceholderText(/name@example\.com/i), { target: { value: 'test@' } });
    fireEvent.change(screen.getByPlaceholderText(/Min\. 8 characters/i), { target: { value: 'Secret1234' } });
    fireEvent.change(screen.getByPlaceholderText(/Repeat password/i), { target: { value: 'Secret1234' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Please enter a valid email address/i)).toBeDefined();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('validates empty mandatory fields and displays field-specific error messages', async () => {
    renderRegister();

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Please enter your first name/i)).toBeDefined();
    expect(screen.getByText(/Please enter your last name/i)).toBeDefined();
    expect(screen.getByText(/Please choose a unique username/i)).toBeDefined();
    expect(screen.getByText(/Please enter a valid email address/i)).toBeDefined();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('displays existing email alert with direct sign in link when email is already registered', async () => {
    authService.register.mockRejectedValue({
      response: {
        data: {
          email: ['An account with this email already exists. Please log in instead.'],
        },
      },
    });

    renderRegister();

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Ashwitha/i), { target: { value: 'Ashwitha' } });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Patel/i), { target: { value: 'Patel' } });
    fireEvent.change(screen.getByPlaceholderText(/Choose a unique username/i), { target: { value: 'ashupatel' } });
    fireEvent.change(screen.getByPlaceholderText(/name@example\.com/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Min\. 8 characters/i), { target: { value: 'Secret1234' } });
    fireEvent.change(screen.getByPlaceholderText(/Repeat password/i), { target: { value: 'Secret1234' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/An account with this email already exists/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Sign In Now/i)).toBeDefined();
    });
  });

  it('successfully submits valid registration data and navigates to /home', async () => {
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
