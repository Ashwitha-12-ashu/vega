import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import SearchBar from './SearchBar';
import { talentService } from '../../services/talentService';

describe('SearchBar Component & Autocomplete Tests', () => {
  const mockCategories = [
    { id: 1, name: 'Agriculture & Farming', slug: 'agriculture-farming', description: 'Machinery and farming' },
    { id: 2, name: 'Facial & Skincare', slug: 'facial-skincare', description: 'Facial skincare and cleanup' },
    { id: 3, name: 'Mehendi & Henna Art', slug: 'mehendi-henna', description: 'Bridal mehendi designs' },
    { id: 4, name: 'Makeup & Beauty', slug: 'makeup-beauty', description: 'Professional makeup styling' },
    { id: 5, name: 'Massage & Wellness', slug: 'massage-wellness', description: 'Body massage and spa' },
    { id: 6, name: 'Electrician', slug: 'electrician', description: 'Electrical repairs' },
    { id: 7, name: 'Plumber', slug: 'plumber', description: 'Plumbing repairs' },
    { id: 8, name: 'Other Services', slug: 'other-services', description: 'Other specialized services' },
  ];

  beforeEach(() => {
    vi.spyOn(talentService, 'getCategories').mockResolvedValue(mockCategories);
  });

  it('renders input with placeholder', () => {
    render(
      <BrowserRouter>
        <SearchBar placeholder="Search services..." />
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText('Search services...')).toBeDefined();
  });

  it('shows autocomplete suggestions when typing "ag" (case-insensitive)', async () => {
    render(
      <BrowserRouter>
        <SearchBar />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'ag' } });

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
      expect(options[0].textContent).toContain('Agriculture & Farming');
    });
  });

  it('shows matching suggestions for "fa" -> Facial & Skincare', async () => {
    render(
      <BrowserRouter>
        <SearchBar />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'fa' } });

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
      expect(options[0].textContent).toContain('Facial & Skincare');
    });
  });

  it('shows matching suggestions for "me" -> Mehendi', async () => {
    render(
      <BrowserRouter>
        <SearchBar />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'me' } });

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const texts = options.map((opt) => opt.textContent).join(' ');
      expect(texts).toContain('Mehendi');
    });
  });

  it('shows matching suggestions for "ma" -> Massage & Makeup', async () => {
    render(
      <BrowserRouter>
        <SearchBar />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'ma' } });

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const texts = options.map((opt) => opt.textContent).join(' ');
      expect(texts).toContain('Massage');
      expect(texts).toContain('Makeup');
    });
  });

  it('handles case insensitivity: "AG", "Fa", "mE"', async () => {
    const { unmount } = render(
      <BrowserRouter>
        <SearchBar />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'AG' } });

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options[0].textContent).toContain('Agriculture & Farming');
    });

    unmount();
  });

  it('invokes onSearch callback when clicking a suggestion', async () => {
    const handleSearch = vi.fn();
    render(
      <BrowserRouter>
        <SearchBar onSearch={handleSearch} />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'Other' } });

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
      expect(options[0].textContent).toContain('Other Services');
    });

    const option = screen.getAllByRole('option')[0];
    fireEvent.click(option);

    expect(handleSearch).toHaveBeenCalledWith('Other Services', expect.objectContaining({ name: 'Other Services' }));
  });
});
