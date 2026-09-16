import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import * as AuthContextModule from '../context/AuthContext';

describe('Navbar Brand Logo & Session Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.scrollTo = vi.fn();
  });

  it('links brand logo to /home when user is authenticated', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { username: 'testuser', first_name: 'Test' },
      isAuthenticated: true,
      isProvider: false,
      isOnline: false,
      logout: vi.fn(),
      goOnline: vi.fn(),
      goOffline: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/explore']}>
        <Navbar />
      </MemoryRouter>
    );

    const logoLink = screen.getByTitle(/VEGA Home/i);
    expect(logoLink.getAttribute('href')).toBe('/home');
  });

  it('scrolls to top when clicking logo while already on /home', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { username: 'testuser', first_name: 'Test' },
      isAuthenticated: true,
      isProvider: false,
      isOnline: false,
      logout: vi.fn(),
      goOnline: vi.fn(),
      goOffline: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/home']}>
        <Navbar />
      </MemoryRouter>
    );

    const logoLink = screen.getByTitle(/VEGA Home/i);
    expect(logoLink.getAttribute('href')).toBe('/home');

    fireEvent.click(logoLink);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('links brand logo to / when user is not authenticated', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isProvider: false,
      isOnline: false,
      logout: vi.fn(),
      goOnline: vi.fn(),
      goOffline: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/explore']}>
        <Navbar />
      </MemoryRouter>
    );

    const logoLink = screen.getByTitle(/VEGA Home/i);
    expect(logoLink.getAttribute('href')).toBe('/');
  });
});
