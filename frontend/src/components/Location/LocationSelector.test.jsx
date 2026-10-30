import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { LocationPermissionBanner, ManualLocationModal } from './LocationSelector';
import * as LocationContextModule from '../../context/LocationContext';

describe('LocationPermissionBanner & Modal Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial prompt message when location is not set', () => {
    const mockRequest = vi.fn();
    const mockOpenManual = vi.fn();
    const mockDismiss = vi.fn();

    vi.spyOn(LocationContextModule, 'useLocation').mockReturnValue({
      coordinates: { lat: null, lng: null, city: '', address: '' },
      isDetecting: false,
      permissionStatus: 'prompt',
      locationError: '',
      isPromptVisible: true,
      dismissPrompt: mockDismiss,
      requestBrowserLocation: mockRequest,
      openManualModal: mockOpenManual,
    });

    render(<LocationPermissionBanner />);

    expect(
      screen.getByText(/VEGA would like to access your location to find nearby service providers\./i)
    ).toBeInTheDocument();

    const allowBtn = screen.getByRole('button', { name: /Allow Location/i });
    expect(allowBtn).toBeInTheDocument();
    fireEvent.click(allowBtn);
    expect(mockRequest).toHaveBeenCalledTimes(1);

    const manualBtn = screen.getByRole('button', { name: /Select City Manually/i });
    expect(manualBtn).toBeInTheDocument();
    fireEvent.click(manualBtn);
    expect(mockOpenManual).toHaveBeenCalledTimes(1);
  });

  it('renders denied message and try again button when permission is denied', () => {
    const mockRequest = vi.fn();

    vi.spyOn(LocationContextModule, 'useLocation').mockReturnValue({
      coordinates: { lat: null, lng: null, city: '', address: '' },
      isDetecting: false,
      permissionStatus: 'denied',
      locationError: 'Location permission was denied.',
      isPromptVisible: true,
      dismissPrompt: vi.fn(),
      requestBrowserLocation: mockRequest,
      openManualModal: vi.fn(),
    });

    render(<LocationPermissionBanner />);

    expect(screen.getByText(/Location permission was denied/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Location access is needed for nearby recommendations in your neighborhood\./i)
    ).toBeInTheDocument();

    const tryAgainBtn = screen.getByRole('button', { name: /Try Again/i });
    expect(tryAgainBtn).toBeInTheDocument();
    fireEvent.click(tryAgainBtn);
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('does not render banner if coordinates are already set', () => {
    vi.spyOn(LocationContextModule, 'useLocation').mockReturnValue({
      coordinates: { lat: 12.9716, lng: 77.5946, city: 'Bengaluru', address: 'Karnataka' },
      isDetecting: false,
      permissionStatus: 'granted',
      locationError: '',
      isPromptVisible: true,
      dismissPrompt: vi.fn(),
      requestBrowserLocation: vi.fn(),
      openManualModal: vi.fn(),
    });

    const { container } = render(<LocationPermissionBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('selects quick popular city in ManualLocationModal', () => {
    const mockSetManual = vi.fn();
    const mockClose = vi.fn();

    vi.spyOn(LocationContextModule, 'useLocation').mockReturnValue({
      isManualModalOpen: true,
      closeManualModal: mockClose,
      setManualLocation: mockSetManual,
      requestBrowserLocation: vi.fn(),
      isDetecting: false,
      coordinates: { lat: null, lng: null, city: '' },
    });

    render(<ManualLocationModal />);

    expect(screen.getByText(/Select Your Location/i)).toBeInTheDocument();
    const bangaloreChip = screen.getByRole('button', { name: /Bengaluru/i });
    expect(bangaloreChip).toBeInTheDocument();

    fireEvent.click(bangaloreChip);
    expect(mockSetManual).toHaveBeenCalledWith(
      expect.objectContaining({
        city: 'Bengaluru',
        lat: 12.9716,
        lng: 77.5946,
      })
    );
  });
});
