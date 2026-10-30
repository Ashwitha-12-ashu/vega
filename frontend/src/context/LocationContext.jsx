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

/**
 * Safely parse coordinates from local storage, with fallback to authenticated user's profile location.
 */
const getSavedOrUserCoords = () => {
  // 1. Check explicit vega_user_coords
  try {
    const saved = localStorage.getItem('vega_user_coords');
    if (saved && saved !== 'undefined') {
      const parsed = JSON.parse(saved);
      if (
        parsed &&
        parsed.lat !== null &&
        parsed.lng !== null &&
        !isNaN(Number(parsed.lat)) &&
        !isNaN(Number(parsed.lng))
      ) {
        return {
          lat: Number(parsed.lat),
          lng: Number(parsed.lng),
          city: parsed.city || 'Your Location',
          address: parsed.address || '',
        };
      }
    }
  } catch (error) {
    console.warn('Failed to parse vega_user_coords:', error);
  }

  // 2. Fallback to authenticated user's location saved in vega_user
  try {
    const savedUser = localStorage.getItem('vega_user');
    if (savedUser && savedUser !== 'undefined') {
      const user = JSON.parse(savedUser);
      if (
        user?.location?.latitude !== undefined &&
        user?.location?.latitude !== null &&
        user?.location?.longitude !== undefined &&
        user?.location?.longitude !== null
      ) {
        return {
          lat: Number(user.location.latitude),
          lng: Number(user.location.longitude),
          city: user.location.city || 'Your Location',
          address: user.location.address || '',
        };
      }
    }
  } catch (error) {
    console.warn('Failed to extract location from vega_user:', error);
  }

  return EMPTY_COORDINATES;
};

export const LocationProvider = ({ children }) => {
  const [coordinates, setCoordinates] = useState(() => getSavedOrUserCoords());
  const [radius, setRadius] = useState(5);
  const [isDetecting, setIsDetecting] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(() => {
    const initial = getSavedOrUserCoords();
    return Boolean(initial.lat !== null && initial.lng !== null);
  });
  const [locationError, setLocationError] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unavailable' | 'timeout'

  // Control whether the top location banner is visible
  const [isPromptVisible, setIsPromptVisible] = useState(() => {
    const initial = getSavedOrUserCoords();
    if (initial.lat !== null && initial.lng !== null) return false;
    const dismissed = sessionStorage.getItem('vega_location_prompt_dismissed');
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
    if (!newCoords || newCoords.lat === null || newCoords.lng === null) return;

    const sanitizedCoords = {
      lat: Number(newCoords.lat),
      lng: Number(newCoords.lng),
      city: newCoords.city || 'Your Location',
      address: newCoords.address || '',
    };

    setCoordinates(sanitizedCoords);
    setHasLocationPermission(true);
    setPermissionStatus('granted');
    setLocationError('');
    setIsPromptVisible(false);

    try {
      localStorage.setItem('vega_user_coords', JSON.stringify(sanitizedCoords));
    } catch (e) {
      console.warn('Could not persist vega_user_coords to localStorage:', e);
    }

    // Send location to Django backend if user is authenticated
    if (localStorage.getItem('vega_access_token')) {
      try {
        await locationService.updateLocation({
          latitude: sanitizedCoords.lat,
          longitude: sanitizedCoords.lng,
          address: sanitizedCoords.address || '',
          city: sanitizedCoords.city || '',
        });
      } catch (error) {
        console.warn('Failed to sync location to backend:', error);
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
   * Uses smart multi-tier detection:
   * 1) Fast Wi-Fi / IP Triangulation (enableHighAccuracy: false)
   * 2) Hardware GPS fallback if available
   * 3) Graceful fallback to user profile / manual selection without crashing
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

    const onLocationSuccess = async (position) => {
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
    };

    const onLocationFailure = (error) => {
      console.warn('Browser geolocation error:', error?.message || error);
      setIsDetecting(false);

      // Check if user already has profile location to fall back to
      const fallbackCoords = getSavedOrUserCoords();
      if (fallbackCoords.lat !== null && fallbackCoords.lng !== null) {
        setCoordinates(fallbackCoords);
        setHasLocationPermission(true);
        setIsPromptVisible(false);
        showToast(`📍 Using your profile location: ${fallbackCoords.city}`, 'info');
        return;
      }

      let message = 'Could not retrieve your location.';
      if (error && error.code === error.PERMISSION_DENIED) {
        message =
          'Location permission was denied. You can select your city manually from the location selector.';
        setPermissionStatus('denied');
      } else if (error && error.code === error.POSITION_UNAVAILABLE) {
        message =
          'GPS location is currently unavailable on this device. You can choose your city manually.';
        setPermissionStatus('unavailable');
      } else if (error && error.code === error.TIMEOUT) {
        message =
          'Location detection timed out. You can select your city manually.';
        setPermissionStatus('timeout');
      }

      setLocationError(message);
      showToast(message, 'warning');
    };

    // Tier 1: Try network/Wi-Fi positioning (enableHighAccuracy: false)
    // This succeeds immediately on laptops, desktop PCs, and indoor mobile devices
    navigator.geolocation.getCurrentPosition(
      onLocationSuccess,
      (err) => {
        // If Wi-Fi/IP location timed out or failed, try high accuracy once
        if (err.code !== err.PERMISSION_DENIED) {
          navigator.geolocation.getCurrentPosition(
            onLocationSuccess,
            onLocationFailure,
            {
              enableHighAccuracy: true,
              timeout: 6000,
              maximumAge: 60000,
            }
          );
        } else {
          onLocationFailure(err);
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000, // Reuse cached position up to 5 minutes
      }
    );
  }, [saveLocation, showToast]);

  /*
   * -----------------------------------------
   * AUTOMATIC LOCATION DETECTION ON OPEN
   * -----------------------------------------
   */
  useEffect(() => {
    // Safely check permission status via Permissions API if available (WebKit/Safari guard)
    if (
      typeof navigator !== 'undefined' &&
      navigator.permissions &&
      typeof navigator.permissions.query === 'function'
    ) {
      try {
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
          .catch(() => {
            // Safari / older WebKit throws TypeError: 'geolocation' is not a valid PermissionName
          });
      } catch {
        // Guard synchronous throw in Safari
      }
    }

    if (hasAttemptedAutoDetection.current) {
      return;
    }
    hasAttemptedAutoDetection.current = true;

    const coords = getSavedOrUserCoords();
    if (coords.lat === null || coords.lng === null) {
      // Prompt for location on initial visit
      const timer = setTimeout(() => {
        requestBrowserLocation();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [requestBrowserLocation]);

  /*
   * -----------------------------------------
   * MULTI-TAB & AUTH SYNC LISTENER
   * Automatically updates coordinates when user logs in
   * -----------------------------------------
   */
  useEffect(() => {
    const handleUserUpdate = () => {
      const latestCoords = getSavedOrUserCoords();
      if (latestCoords.lat !== null && latestCoords.lng !== null) {
        setCoordinates((prev) => {
          if (prev.lat === null || prev.lng === null) {
            return latestCoords;
          }
          return prev;
        });
        setHasLocationPermission(true);
        setIsPromptVisible(false);
      }
    };

    window.addEventListener('vega_user_updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);
    return () => {
      window.removeEventListener('vega_user_updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, []);

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
    try {
      sessionStorage.setItem('vega_location_prompt_dismissed', 'true');
    } catch {
      // Storage quota guard
    }
  };

  /*
   * -----------------------------------------
   * CLEAR LOCATION
   * -----------------------------------------
   */
  const clearLocation = () => {
    try {
      localStorage.removeItem('vega_user_coords');
      sessionStorage.removeItem('vega_location_prompt_dismissed');
    } catch {
      // Storage guard
    }
    setCoordinates(EMPTY_COORDINATES);
    setHasLocationPermission(false);
    setPermissionStatus('prompt');
    setLocationError('');
    setIsPromptVisible(true);
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

export default LocationContext;