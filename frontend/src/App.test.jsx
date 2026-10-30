import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('VEGA Frontend App Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, 'Landing Page', '/');
  });

  it('renders VEGA branding on landing page', () => {
    render(<App />);
    const brandElements = screen.getAllByText(/VEGA/i);
    expect(brandElements.length).toBeGreaterThan(0);
  });

  it('renders navigation links for Services and Home', () => {
    render(<App />);
    const serviceElements = screen.getAllByText(/Services/i);
    expect(serviceElements.length).toBeGreaterThan(0);
    const homeElements = screen.getAllByText(/Home/i);
    expect(homeElements.length).toBeGreaterThan(0);
  });

  it('renders call to action buttons', () => {
    render(<App />);
    expect(screen.getByText(/Login \/ Sign Up/i)).toBeDefined();
    expect(screen.getByText(/Find Trusted Local/i)).toBeDefined();
  });

  it('renders Home page when user is logged in', async () => {
    localStorage.setItem('vega_access_token', 'test_access_token');
    localStorage.setItem('vega_user', JSON.stringify({
      id: 1,
      username: 'aditya_customer',
      email: 'customer.ongole@vega.app',
      first_name: 'Aditya',
      last_name: 'Varma',
      full_name: 'Aditya Varma',
      profile: { is_provider: false, is_online: false },
      location: { latitude: 15.5057, longitude: 80.0499, city: 'Ongole' }
    }));
    window.history.pushState({}, 'Home Page', '/home');

    render(<App />);
    expect(await screen.findByText(/What service/i, {}, { timeout: 4000 })).toBeDefined();
  });
});
