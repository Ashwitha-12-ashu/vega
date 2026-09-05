import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';

import { locationService } from '../services/locationService';
import { useToast } from './ToastContext';


const LocationContext = createContext(null);


// No fake/default location.
// We want the real browser location.
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
          parsed.lng !== null
        ) {
          return parsed;
        }

      } catch (error) {
        console.error(
          'Failed to read saved location:',
          error
        );
      }
    }

    return EMPTY_COORDINATES;
  });


  const [radius, setRadius] = useState(5);

  const [isDetecting, setIsDetecting] = useState(false);

  const [hasLocationPermission, setHasLocationPermission] =
    useState(false);

  const [locationError, setLocationError] =
    useState('');

  const hasAttemptedAutoDetection = useRef(false);

  const { showToast } = useToast();


  /*
   * -----------------------------------------
   * SAVE LOCATION
   * -----------------------------------------
   */

  const saveLocation = async (newCoords) => {

    setCoordinates(newCoords);

    localStorage.setItem(
      'vega_user_coords',
      JSON.stringify(newCoords)
    );


    /*
     * Send location to Django backend
     * if user is logged in.
     */

    if (localStorage.getItem('vega_access_token')) {

      try {

        await locationService.updateLocation({

          latitude: newCoords.lat,

          longitude: newCoords.lng,

          address: newCoords.address || '',

          city: newCoords.city || '',

        });

        console.log(
          'Location synced with VEGA backend'
        );

      } catch (error) {

        console.error(
          'Failed to sync location to backend:',
          error
        );

      }
    }
  };


  /*
   * -----------------------------------------
   * DETECT REAL BROWSER LOCATION
   * -----------------------------------------
   */

  const requestBrowserLocation = () => {

    if (!navigator.geolocation) {

      const message =
        'Geolocation is not supported by your browser.';

      setLocationError(message);

      showToast(
        message,
        'warning'
      );

      return;
    }


    setIsDetecting(true);

    setLocationError('');


    navigator.geolocation.getCurrentPosition(

      async (position) => {

        try {

          const {
            latitude,
            longitude,
          } = position.coords;


          const newCoords = {

            lat: parseFloat(
              latitude.toFixed(6)
            ),

            lng: parseFloat(
              longitude.toFixed(6)
            ),

            city: 'Current Location',

            address: 'GPS Location',

          };


          await saveLocation(
            newCoords
          );


          setHasLocationPermission(true);

          setIsDetecting(false);


          showToast(
            'Your location was detected successfully.',
            'success'
          );


        } catch (error) {

          console.error(
            'Location processing failed:',
            error
          );

          setIsDetecting(false);

          setLocationError(
            'Unable to save your location.'
          );

        }

      },


      (error) => {

        console.error(
          'Browser geolocation error:',
          error
        );


        setIsDetecting(false);


        let message =
          'Could not retrieve your location.';


        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {

          message =
            'Location permission was denied. Please allow location access in your browser.';

        } else if (
          error.code ===
          error.POSITION_UNAVAILABLE
        ) {

          message =
            'Your location is currently unavailable.';

        } else if (
          error.code ===
          error.TIMEOUT
        ) {

          message =
            'Location detection timed out. Please try again.';

        }


        setLocationError(message);

        showToast(
          message,
          'warning'
        );

      },


      {
        enableHighAccuracy: true,

        timeout: 15000,

        maximumAge: 0,

      }

    );
  };


  /*
   * -----------------------------------------
   * AUTOMATIC LOCATION DETECTION
   * -----------------------------------------
   *
   * When the user opens VEGA Home for the
   * first time, automatically ask for GPS.
   */

  useEffect(() => {

    if (
      hasAttemptedAutoDetection.current
    ) {
      return;
    }


    hasAttemptedAutoDetection.current = true;


    const saved =
      localStorage.getItem(
        'vega_user_coords'
      );


    /*
     * If there is no saved location,
     * automatically detect GPS.
     */

    if (!saved) {

      const timer = setTimeout(() => {

        requestBrowserLocation();

      }, 700);


      return () => clearTimeout(timer);
    }

  }, []);


  /*
   * -----------------------------------------
   * MANUAL LOCATION
   * -----------------------------------------
   */

  const setManualLocation = async ({
    lat,
    lng,
    city,
    address,
  }) => {

    const newCoords = {

      lat: parseFloat(lat),

      lng: parseFloat(lng),

      city:
        city ||
        'Custom Location',

      address:
        address ||
        '',

    };


    await saveLocation(
      newCoords
    );


    setHasLocationPermission(
      true
    );


    setLocationError('');


    showToast(
      `Location set to ${newCoords.city}.`,
      'info'
    );

  };


  /*
   * -----------------------------------------
   * CLEAR LOCATION
   * -----------------------------------------
   */

  const clearLocation = () => {

    localStorage.removeItem(
      'vega_user_coords'
    );

    setCoordinates(
      EMPTY_COORDINATES
    );

    setHasLocationPermission(
      false
    );

    setLocationError('');

  };


  return (

    <LocationContext.Provider
      value={{

        coordinates,

        radius,

        setRadius,

        isDetecting,

        hasLocationPermission,

        locationError,

        requestBrowserLocation,

        setManualLocation,

        clearLocation,

      }}
    >

      {children}

    </LocationContext.Provider>

  );

};


export const useLocation = () => {

  const context =
    useContext(LocationContext);


  if (!context) {

    throw new Error(
      'useLocation must be used within a LocationProvider'
    );

  }


  return context;

};