import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import * as AuthContextModule from '../context/AuthContext';

describe('PublicRoute Guard Tests', () => {
  it('renders guest content when user is not authenticated', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div>Login Form Component</div>
              </PublicRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Login Form Component/i)).toBeDefined();
  });

  it('redirects to /home when user is authenticated', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { username: 'testuser' },
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div>Login Form Component</div>
              </PublicRoute>
            }
          />
          <Route path="/home" element={<div>Home Authenticated Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText(/Login Form Component/i)).toBeNull();
    expect(screen.getByText(/Home Authenticated Dashboard/i)).toBeDefined();
  });
});
