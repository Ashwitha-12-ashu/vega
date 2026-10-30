import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import ServicesSection from './ServicesSection';
import { talentService } from '../../services/talentService';

const mockCategories = [
  { id: 1, name: 'Cleaning', slug: 'cleaning', description: 'Home deep cleaning' },
  { id: 2, name: 'Hair Styling', slug: 'hair-styling', description: 'Haircuts and grooming' },
  { id: 3, name: 'Mehendi & Henna Art', slug: 'mehendi-henna-art', description: 'Bridal mehendi and festive patterns' },
  { id: 4, name: 'Beauty & Makeup', slug: 'makeup-beauty', description: 'Makeup and grooming' },
  { id: 5, name: 'Agriculture & Farming', slug: 'agriculture-farming', description: 'Agricultural equipment & crop support' },
  { id: 6, name: 'Facial & Skincare', slug: 'facial-skincare', description: 'Facials and skin rejuvenation' },
  { id: 7, name: 'Plumber', slug: 'plumber', description: 'Pipes and leakage repair' },
  { id: 8, name: 'Electrician', slug: 'electrician', description: 'Wiring and fixture repair' },
  { id: 9, name: 'Painting', slug: 'painting', description: 'Wall and decorative painting' },
  { id: 10, name: 'Cooking & Chef', slug: 'home-cooking-chef', description: 'Home cooking and catering' },
  { id: 11, name: 'Gardening', slug: 'gardening', description: 'Garden and lawn care' },
  { id: 12, name: 'Laundry', slug: 'laundry', description: 'Washing and dry cleaning' },
  { id: 13, name: 'AC Repair', slug: 'ac-repair', description: 'Cooling and appliance maintenance' },
  { id: 14, name: 'Other Services', slug: 'other-services', description: 'Specialized local craftsmen services' },
];

vi.mock('../../services/talentService', () => ({
  talentService: {
    getCategories: vi.fn(),
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

describe('VEGA ServicesSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    talentService.getCategories.mockResolvedValue(mockCategories);
  });

  const renderSection = (props = {}) =>
    render(
      <MemoryRouter>
        <ServicesSection {...props} />
      </MemoryRouter>
    );

  it('renders initial state with ONLY 5 primary service cards + 1 "Other Services" card (6 cards total)', async () => {
    renderSection();

    await waitFor(() => {
      // 5 popular services matched
      expect(screen.getByText('Cleaning')).toBeDefined();
      expect(screen.getByText('Hair Styling')).toBeDefined();
      expect(screen.getByText('Mehendi & Henna Art')).toBeDefined();
      expect(screen.getByText('Beauty & Makeup')).toBeDefined();
      expect(screen.getByText('Agriculture & Farming')).toBeDefined();

      // 6th card is "Other Services"
      expect(screen.getByText('Other Services')).toBeDefined();
    });

    // Remaining services MUST NOT be rendered initially
    expect(screen.queryByText('Electrician')).toBeNull();
    expect(screen.queryByText('Plumber')).toBeNull();
    expect(screen.queryByText('Cooking & Chef')).toBeNull();
    expect(screen.queryByText('Gardening')).toBeNull();
    expect(screen.queryByText('Laundry')).toBeNull();
  });

  it('expands remaining services and reveals search input when "Other Services" card is clicked', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Other Services')).toBeDefined();
    });

    const otherServicesCard = screen.getByText('Other Services');
    fireEvent.click(otherServicesCard);

    // Remaining services should now be rendered
    await waitFor(() => {
      expect(screen.getByText('Plumber')).toBeDefined();
      expect(screen.getByText('Electrician')).toBeDefined();
      expect(screen.getByText('Facial & Skincare')).toBeDefined();
      expect(screen.getByText('Cooking & Chef')).toBeDefined();
    });

    // In-section search input should be present
    expect(screen.getByPlaceholderText(/Search other services/i)).toBeDefined();

    // Show Less toggle text should be present
    expect(screen.getAllByText('Show Less').length).toBeGreaterThanOrEqual(1);
  });

  it('filters remaining services case-insensitively when typing in search input', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Other Services')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Other Services'));

    const searchInput = screen.getByPlaceholderText(/Search other services/i);
    fireEvent.change(searchInput, { target: { value: 'fa' } });

    // Facial & Skincare matches 'fa'
    expect(screen.getByText('Facial & Skincare')).toBeDefined();
    // Non-matching services in remaining list should be hidden
    expect(screen.queryByText('Plumber')).toBeNull();
    expect(screen.queryByText('Electrician')).toBeNull();
  });

  it('displays "No matching services found" when search yields zero matches', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Other Services')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Other Services'));

    const searchInput = screen.getByPlaceholderText(/Search other services/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistentxyz' } });

    expect(screen.getByText('No matching services found')).toBeDefined();
  });

  it('collapses back to the 6 initial cards when Show Less button is clicked', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Other Services')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Other Services'));
    expect(screen.getByText('Plumber')).toBeDefined();

    // Click collapse button
    const collapseBtn = screen.getByTitle('Collapse more services');
    fireEvent.click(collapseBtn);

    // Remaining services should be hidden again
    expect(screen.queryByText('Plumber')).toBeNull();
    expect(screen.getByText('Other Services')).toBeDefined();
  });

  it('calls onSelectCategory or navigates when a service card is clicked', async () => {
    const handleSelect = vi.fn();
    renderSection({ onSelectCategory: handleSelect });

    await waitFor(() => {
      expect(screen.getByText('Cleaning')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Cleaning'));
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Cleaning', slug: 'cleaning' })
    );
  });
});
