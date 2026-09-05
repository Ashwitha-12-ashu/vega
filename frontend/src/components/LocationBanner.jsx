import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { MapPin, Navigation, Compass, Sliders, Check } from 'lucide-react';

const LocationBanner = ({ showRadiusSelector = true, onSearchTrigger }) => {
  const { coordinates, radius, setRadius, isDetecting, requestBrowserLocation, setManualLocation } = useLocation();
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [cityInput, setCityInput] = useState(coordinates.city || '');
  const [addressInput, setAddressInput] = useState(coordinates.address || '');

  const radiusOptions = [1, 2, 5, 10, 20];

  const handleSaveManual = (e) => {
    e.preventDefault();
    setManualLocation({
      lat: coordinates.lat,
      lng: coordinates.lng,
      city: cityInput,
      address: addressInput,
    });
    setIsEditingAddress(false);
    if (onSearchTrigger) onSearchTrigger();
  };

  return (
    <div
      className="card"
      style={{
        padding: '1.5rem 1.75rem',
        marginBottom: '2rem',
        background: '#ffffff',
        boxShadow: 'var(--shadow-md)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(226, 232, 240, 0.9)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        {/* Current Location Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)',
            }}
          >
            <MapPin size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-600)', letterSpacing: '0.08em' }}>
              Active Location
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {coordinates.city || 'Central District'}
              </h3>
              {coordinates.address && (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  • {coordinates.address}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: GPS Detect & Manual Entry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={requestBrowserLocation}
            disabled={isDetecting}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Navigation size={15} className={isDetecting ? 'spin-animation' : ''} />
            <span>{isDetecting ? 'Detecting GPS...' : 'Use My GPS'}</span>
          </button>

          <button
            onClick={() => setIsEditingAddress(!isEditingAddress)}
            className="btn btn-outline btn-sm"
          >
            {isEditingAddress ? 'Cancel' : 'Change City'}
          </button>
        </div>
      </div>

      {/* Manual Edit Form */}
      {isEditingAddress && (
        <form
          onSubmit={handleSaveManual}
          style={{
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            placeholder="City (e.g. Bangalore, Austin, SF)"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            className="form-input"
            style={{ flex: 1, minWidth: '180px' }}
            required
          />
          <input
            type="text"
            placeholder="Area / Landmark / Street Address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            className="form-input"
            style={{ flex: 2, minWidth: '220px' }}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            <Check size={16} /> Save Location
          </button>
        </form>
      )}

      {/* Radius Filter Chips */}
      {showRadiusSelector && (
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--slate-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-700)', fontSize: '0.875rem', fontWeight: 600 }}>
            <Sliders size={16} color="var(--primary-600)" />
            <span>Search Proximity Radius:</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {radiusOptions.map((r) => {
              const isSelected = radius === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRadius(r);
                    if (onSearchTrigger) setTimeout(onSearchTrigger, 50);
                  }}
                  style={{
                    padding: '0.35rem 0.875rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    border: '1px solid',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    backgroundColor: isSelected ? 'var(--primary-600)' : 'var(--slate-100)',
                    color: isSelected ? '#ffffff' : 'var(--slate-700)',
                    borderColor: isSelected ? 'var(--primary-600)' : 'var(--slate-200)',
                    boxShadow: isSelected ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
                    transform: isSelected ? 'scale(1.04)' : 'none',
                  }}
                >
                  {r} km
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationBanner;
