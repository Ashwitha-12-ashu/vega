import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import {
  MapPin,
  Navigation,
  LocateFixed,
  X,
  AlertTriangle,
  RotateCw,
  Search,
  Check,
} from 'lucide-react';
import './LocationSelector.css';

const POPULAR_CITIES = [
  { city: 'Bengaluru', lat: 12.9716, lng: 77.5946, address: 'Bengaluru, Karnataka' },
  { city: 'Mumbai', lat: 19.0760, lng: 72.8777, address: 'Mumbai, Maharashtra' },
  { city: 'Delhi NCR', lat: 28.6139, lng: 77.2090, address: 'New Delhi, Delhi' },
  { city: 'Hyderabad', lat: 17.3850, lng: 78.4867, address: 'Hyderabad, Telangana' },
  { city: 'Chennai', lat: 13.0827, lng: 80.2707, address: 'Chennai, Tamil Nadu' },
  { city: 'Pune', lat: 18.5204, lng: 73.8567, address: 'Pune, Maharashtra' },
  { city: 'Kolkata', lat: 22.5726, lng: 88.3639, address: 'Kolkata, West Bengal' },
  { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714, address: 'Ahmedabad, Gujarat' },
  { city: 'Jaipur', lat: 26.9124, lng: 75.7873, address: 'Jaipur, Rajasthan' },
  { city: 'Chandigarh', lat: 30.7333, lng: 76.7794, address: 'Chandigarh, Punjab' },
];

export const LocationPermissionBanner = () => {
  const {
    coordinates,
    isDetecting,
    permissionStatus,
    locationError,
    isPromptVisible,
    dismissPrompt,
    requestBrowserLocation,
    openManualModal,
  } = useLocation();

  // If user already has valid coordinates and banner was dismissed, hide
  if (!isPromptVisible || (coordinates?.lat !== null && coordinates?.lng !== null)) {
    return null;
  }

  const isDenied = permissionStatus === 'denied';
  const isUnavailable = permissionStatus === 'unavailable' || permissionStatus === 'timeout';

  let bannerClass = 'location-permission-banner';
  if (isDenied) bannerClass += ' denied';
  else if (isUnavailable) bannerClass += ' error';

  return (
    <aside className={bannerClass} role="region" aria-label="Location Permission Prompt">
      <div className="location-banner-container">
        <div className="location-banner-content">
          <div className="location-banner-icon">
            {isDenied || isUnavailable ? (
              <AlertTriangle size={20} />
            ) : (
              <MapPin size={20} />
            )}
          </div>
          <div>
            <h3 className="location-banner-title">
              {isDenied
                ? 'Location permission was denied'
                : isUnavailable
                ? 'Location services are unavailable'
                : 'VEGA would like to access your location to find nearby service providers.'}
            </h3>
            <p className="location-banner-desc">
              {isDenied
                ? 'Location access is needed for nearby recommendations in your neighborhood.'
                : isUnavailable
                ? 'Could not determine GPS coordinates. You can try again or select your city manually.'
                : 'Enable GPS to instantly discover background-verified professionals in your neighborhood.'}
            </p>
          </div>
        </div>

        <div className="location-banner-actions">
          {isDenied || isUnavailable ? (
            <button
              onClick={requestBrowserLocation}
              disabled={isDetecting}
              className="btn-loc-primary"
              title="Request browser location again"
            >
              <RotateCw size={14} className={isDetecting ? 'spin-anim' : ''} />
              <span>{isDetecting ? 'Detecting...' : 'Try Again'}</span>
            </button>
          ) : (
            <button
              onClick={requestBrowserLocation}
              disabled={isDetecting}
              className="btn-loc-primary"
            >
              <LocateFixed size={15} className={isDetecting ? 'spin-anim' : ''} />
              <span>{isDetecting ? 'Detecting GPS...' : 'Allow Location'}</span>
            </button>
          )}

          <button
            onClick={openManualModal}
            className="btn-loc-secondary"
          >
            <MapPin size={14} />
            <span>Select City Manually</span>
          </button>

          <button
            onClick={dismissPrompt}
            className="btn-loc-dismiss"
            title="Dismiss notice"
            aria-label="Dismiss notice"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export const ManualLocationModal = () => {
  const {
    isManualModalOpen,
    closeManualModal,
    setManualLocation,
    requestBrowserLocation,
    isDetecting,
    coordinates,
  } = useLocation();

  const [customCity, setCustomCity] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  if (!isManualModalOpen) return null;

  const handleCitySelect = (item) => {
    setManualLocation({
      lat: item.lat,
      lng: item.lng,
      city: item.city,
      address: item.address,
    });
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customCity.trim()) return;

    setIsSearching(true);
    setSearchError('');

    try {
      // Use free OpenStreetMap geocoding for any custom city / area
      const query = [customCity, customAddress, 'India'].filter(Boolean).join(', ');
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );

      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const first = results[0];
          await setManualLocation({
            lat: parseFloat(first.lat),
            lng: parseFloat(first.lon),
            city: customCity.trim(),
            address: customAddress.trim() || first.display_name.split(',').slice(0, 2).join(','),
          });
          return;
        }
      }

      // If geocoding had no hits, check if it matches a known city name or fallback gracefully
      const matched = POPULAR_CITIES.find(
        (c) => c.city.toLowerCase() === customCity.trim().toLowerCase()
      );
      if (matched) {
        await setManualLocation({
          lat: matched.lat,
          lng: matched.lng,
          city: matched.city,
          address: customAddress.trim() || matched.address,
        });
      } else {
        // Fallback default coordinates (Bengaluru tech hub center)
        await setManualLocation({
          lat: 12.9716,
          lng: 77.5946,
          city: customCity.trim(),
          address: customAddress.trim() || 'Central District',
        });
      }
    } catch {
      await setManualLocation({
        lat: 12.9716,
        lng: 77.5946,
        city: customCity.trim(),
        address: customAddress.trim() || '',
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      className="location-modal-backdrop"
      onClick={closeManualModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-loc-title"
    >
      <div
        className="location-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="location-modal-header">
          <h3 id="modal-loc-title">
            <MapPin size={20} color="#0284c7" />
            <span>Select Your Location</span>
          </h3>
          <button
            onClick={closeManualModal}
            className="btn-loc-dismiss"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="location-modal-body">
          {/* Live GPS Detection Button */}
          <div className="gps-detect-card">
            <div className="gps-detect-info">
              <h4>Use Live GPS Location</h4>
              <p>Automatically detect your current device coordinates</p>
            </div>
            <button
              onClick={() => {
                requestBrowserLocation();
                closeManualModal();
              }}
              disabled={isDetecting}
              className="btn-loc-primary"
            >
              <Navigation size={15} className={isDetecting ? 'spin-anim' : ''} />
              <span>{isDetecting ? 'Detecting...' : 'Detect GPS'}</span>
            </button>
          </div>

          {/* Quick Pick Popular Cities */}
          <div className="popular-cities-title">Quick Select City</div>
          <div className="city-chips-grid">
            {POPULAR_CITIES.map((c) => {
              const isSelected = coordinates?.city === c.city;
              return (
                <button
                  key={c.city}
                  type="button"
                  onClick={() => handleCitySelect(c)}
                  className="city-chip"
                  style={{
                    backgroundColor: isSelected ? '#0284c7' : undefined,
                    color: isSelected ? '#ffffff' : undefined,
                    borderColor: isSelected ? '#0284c7' : undefined,
                  }}
                >
                  {isSelected && <Check size={12} style={{ marginRight: '4px' }} />}
                  {c.city}
                </button>
              );
            })}
          </div>

          {/* Custom City Search Form */}
          <form onSubmit={handleCustomSubmit} className="custom-city-form">
            <div className="popular-cities-title" style={{ marginBottom: '4px' }}>
              Or Enter Custom City / Area
            </div>
            <div className="custom-city-row">
              <input
                type="text"
                placeholder="City name (e.g. Mysuru, Kochi, Indore)"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                className="custom-city-input"
                required
              />
              <button
                type="submit"
                disabled={isSearching}
                className="btn-loc-primary"
                style={{ flexShrink: 0 }}
              >
                <Search size={15} className={isSearching ? 'spin-anim' : ''} />
                <span>{isSearching ? 'Saving...' : 'Set Location'}</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="Area / Landmark (optional, e.g. Sector 5, Indiranagar)"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              className="custom-city-input"
              style={{ fontSize: '0.825rem', padding: '0.5rem 0.85rem' }}
            />
            {searchError && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                {searchError}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionBanner;
