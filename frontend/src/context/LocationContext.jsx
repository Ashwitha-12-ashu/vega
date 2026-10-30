import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

import { locationService } from '../services/locationService';
import { useToast } from './ToastContext';

const LocationContext = createContext(null);

const EMPTY_COORDINATES = {
  lat: null,
  lng: null,
  city: '',
  address: '',
};

export const LocationProvider = ({ children }) => {
  const [coordinates, setCoordinates] = useState(() => {
    const saved = localStorage.getItem('vega_user_coords');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.lat !== null &&
          parsed.lng !== null &&
          !isNaN(parsed.lat) &&
          !isNaN(parsed.lng)
        ) {
          return parsed;
        }
      } catch (error) {
        console.error('Failed to read saved location:', error);
      }
    }
    return EMPTY_COORDINATES;
  });

  const [radius, setRadius] = useState(5);
  const [isDetecting, setIsDetecting] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(() => {
    const saved = localStorage.getItem('vega_user_coords');
    return Boolean(saved && JSON.parse(saved)?.lat !== null);
  });
  const [locationError, setLocationError] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unavailable' | 'timeout'

  // Control whether the top location banner is visible
  const [isPromptVisible, setIsPromptVisible] = useState(() => {
    // Only show if user does not already have valid coordinates and hasn't dismissed this session
    const saved = localStorage.getItem('vega_user_coords');
    const dismissed = sessionStorage.getItem('vega_location_prompt_dismissed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.lat !== null && parsed?.lng !== null) return false;
      } catch (e) {
        // Continue
      }
    }
    return !dismissed;
  });

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const hasAttemptedAutoDetection = useRef(false);
  const { showToast } = useToast();

  /*
   * -----------------------------------------
   * SAVE LOCATION (State, Storage & Backend)
   * -----------------------------------------
   */
  const saveLocation = useCallback(async (newCoords) => {
    setCoordinates(newCoords);
    setHasLocationPermission(true);
    setPermissionStatus('granted');
    setLocationError('');
    setIsPromptVisible(false);

    localStorage.setItem('vega_user_coords', JSON.stringify(newCoords));

    // Send location to Django backend if user is authenticated
    if (localStorage.getItem('vega_access_token')) {
      try {
        await locationService.updateLocation({
          latitude: newCoords.lat,
          longitude: newCoords.lng,
          address: newCoords.address || '',
          city: newCoords.city || '',
        });
      } catch (error) {
        console.error('Failed to sync location to backend:', error);
      }
    }
  }, []);

  /*
   * -----------------------------------------
   * REVERSE GEOCODING (Real Place Name)
   * -----------------------------------------
   */
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        {
          signal: controller.signal,
          headers: { 'Accept-Language': 'en' },
        }
      );
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.suburb ||
          addr.county ||
          addr.state_district ||
          'Current Location';
        const neighborhood =
          addr.neighbourhood || addr.suburb || addr.residential || '';
        const address = neighborhood
          ? `${neighborhood}, ${city}`
          : data.display_name?.split(',').slice(0, 2).join(',') || city;

        return { city, address };
      }
    } catch {
      // Fallback if network/timeout occurs
    }
    return { city: 'Current Location', address: 'GPS Location' };
  };

  /*
   * -----------------------------------------
   * DETECT REAL BROWSER LOCATION
   * -----------------------------------------
   */
  const requestBrowserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      const message = 'Geolocation is not supported by your browser.';
      setLocationError(message);
      setPermissionStatus('unavailable');
      showToast(message, 'warning');
      return;
    }

    setIsDetecting(true);
    setLocationError('');
    setIsPromptVisible(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const lat = parseFloat(latitude.toFixed(6));
          const lng = parseFloat(longitude.toFixed(6));

          // Fetch human-readable city/neighborhood
          const { city, address } = await reverseGeocode(lat, lng);

          const newCoords = {
            lat,
            lng,
            city,
            address,
          };

          await saveLocation(newCoords);
          setIsDetecting(false);
          showToast(`📍 Location detected: ${city}`, 'success');
        } catch (error) {
          console.error('Location processing failed:', error);
          setIsDetecting(false);
          setLocationError('Unable to process your GPS location.');
        }
      },
      (error) => {
        console.warn('Browser geolocation error:', error);
        setIsDetecting(false);

        let message = 'Could not retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          message =
            'Location permission was denied. Location access is needed to find nearby service providers in your neighborhood.';
          setPermissionStatus('denied');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message =
            'Your GPS location is currently unavailable. Please check your device location settings or select your city manually.';
          setPermissionStatus('unavailable');
        } else if (error.code === error.TIMEOUT) {
          message =
            'Location detection timed out. Please try again or select your city manually.';
          setPermissionStatus('timeout');
        }

        setLocationError(message);
        showToast(message, 'warning');
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  }, [saveLocation, showToast]);

  /*
   * -----------------------------------------
   * AUTOMATIC LOCATION DETECTION ON OPEN
   * -----------------------------------------
   * Whenever someone opens the deployed VEGA
   * website link, immediately request location.
   */
  useEffect(() => {
    // Check permission status via Permissions API if available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((perm) => {
          if (perm.state === 'granted') {
            setPermissionStatus('granted');
          } else if (perm.state === 'denied') {
            setPermissionStatus('denied');
          } else {
            setPermissionStatus('prompt');
          }

          perm.onchange = () => {
            if (perm.state === 'granted') {
              setPermissionStatus('granted');
              setHasLocationPermission(true);
              setIsPromptVisible(false);
              requestBrowserLocation();
            } else if (perm.state === 'denied') {
              setPermissionStatus('denied');
              setHasLocationPermission(false);
            }
          };
        })
        .catch(() => {});
    }

    if (hasAttemptedAutoDetection.current) {
      return;
    }
    hasAttemptedAutoDetection.current = true;

    const saved = localStorage.getItem('vega_user_coords');
    if (!saved) {
      // Immediately prompt for location on initial visit
      const timer = setTimeout(() => {
        requestBrowserLocation();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [requestBrowserLocation]);

  /*
   * -----------------------------------------
   * MANUAL LOCATION SELECTION
   * -----------------------------------------
   */
  const setManualLocation = async ({ lat, lng, city, address }) => {
    const newCoords = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      city: city || 'Selected City',
      address: address || '',
    };

    await saveLocation(newCoords);
    setIsManualModalOpen(false);
    showToast(`📍 Location set to ${newCoords.city}.`, 'info');
  };

  /*
   * -----------------------------------------
   * DISMISS PROMPT (Don't repeatedly nag)
   * -----------------------------------------
   */
  const dismissPrompt = () => {
    setIsPromptVisible(false);
    sessionStorage.setItem('vega_location_prompt_dismissed', 'true');
  };

  /*
   * -----------------------------------------
   * CLEAR LOCATION
   * -----------------------------------------
   */
  const clearLocation = () => {
    localStorage.removeItem('vega_user_coords');
    setCoordinates(EMPTY_COORDINATES);
    setHasLocationPermission(false);
    setPermissionStatus('prompt');
    setLocationError('');
    setIsPromptVisible(true);
    sessionStorage.removeItem('vega_location_prompt_dismissed');
  };

  const openManualModal = () => setIsManualModalOpen(true);
  const closeManualModal = () => setIsManualModalOpen(false);

  return (
    <LocationContext.Provider
      value={{
        coordinates,
        radius,
        setRadius,
        isDetecting,
        hasLocationPermission,
        permissionStatus,
        locationError,
        isPromptVisible,
        dismissPrompt,
        requestBrowserLocation,
        setManualLocation,
        clearLocation,
        isManualModalOpen,
        openManualModal,
        closeManualModal,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    return {
      coordinates: EMPTY_COORDINATES,
      radius: 5,
      setRadius: () => {},
      isDetecting: false,
      hasLocationPermission: false,
      permissionStatus: 'prompt',
      locationError: '',
      isPromptVisible: false,
      dismissPrompt: () => {},
      requestBrowserLocation: () => {},
      setManualLocation: () => {},
      clearLocation: () => {},
      isManualModalOpen: false,
      openManualModal: () => {},
      closeManualModal: () => {},
    };
  }
  return context;
};