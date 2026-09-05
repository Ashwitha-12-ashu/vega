import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('VEGA Frontend App Component Tests', () => {
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
});
