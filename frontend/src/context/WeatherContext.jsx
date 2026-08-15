import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWeatherData, reverseGeocode } from '../services/openMeteoApi';
import { getWeatherConfig } from '../services/wmoCodes';
import { saveBackendSearchHistory } from '../services/backendApi';

const WeatherContext = createContext();

const DEFAULT_CITY = {
  name: 'Tokyo',
  country: 'Japan',
  lat: 35.6762,
  lon: 139.6503,
};

export const WeatherProvider = ({ children }) => {
  const [unit, setUnit] = useState('C'); // 'C' or 'F'
  const [activeLocation, setActiveLocation] = useState(() => {
    try {
      const savedActive = localStorage.getItem('atmosphere_active_location');
      return savedActive ? JSON.parse(savedActive) : DEFAULT_CITY;
    } catch {
      return DEFAULT_CITY;
    }
  });

  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize savedLocations from localStorage so saved places persist across reloads
  const [savedLocations, setSavedLocations] = useState(() => {
    try {
      const local = localStorage.getItem('atmosphere_saved_locations');
      return local ? JSON.parse(local) : [
        DEFAULT_CITY,
        { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
        { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.006 },
        { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
      ];
    } catch {
      return [
        DEFAULT_CITY,
        { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
        { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.006 },
        { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
      ];
    }
  });

  // Save savedLocations to localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem('atmosphere_saved_locations', JSON.stringify(savedLocations));
    } catch (err) {
      console.warn('Failed to persist savedLocations to localStorage:', err);
    }
  }, [savedLocations]);

  // Save activeLocation to localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem('atmosphere_active_location', JSON.stringify(activeLocation));
    } catch (err) {
      console.warn('Failed to persist activeLocation to localStorage:', err);
    }
  }, [activeLocation]);

  // Load weather when activeLocation changes
  const loadWeather = async (loc) => {
    setIsTransitioning(true);
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherData(loc.lat, loc.lon);
      setWeatherData(data);
    } catch (err) {
      console.error('Failed to load weather:', err);
      setError('Unable to fetch live weather data. Displaying fallback radar scene.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }
  };

  useEffect(() => {
    loadWeather(activeLocation);
  }, [activeLocation]);

  // Try Geolocating user on initial load if no saved location is found
  useEffect(() => {
    const hasLocalActive = localStorage.getItem('atmosphere_active_location');
    if (!hasLocalActive && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const locInfo = await reverseGeocode(lat, lon);
          const userLoc = {
            name: locInfo.city || 'Your Location',
            country: locInfo.country || '',
            lat,
            lon,
          };
          setActiveLocation(userLoc);
        },
        (err) => {
          console.warn('Initial geolocation access notice:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  const toggleUnit = () => setUnit((prev) => (prev === 'C' ? 'F' : 'C'));

  const convertTemp = (tempC) => {
    if (tempC === undefined || tempC === null) return 0;
    if (unit === 'F') {
      return Math.round((tempC * 9) / 5 + 32);
    }
    return Math.round(tempC);
  };

  const addSavedLocation = (loc, user = null) => {
    if (!savedLocations.some((item) => item.lat === loc.lat && item.lon === loc.lon)) {
      const updated = [...savedLocations, loc];
      setSavedLocations(updated);

      // Sync with Express backend & Google Firebase Database if user is logged in
      if (user?.id || user?.mobile || user?.email) {
        const userId = user.id || user.mobile || user.email;
        saveBackendSearchHistory(userId, loc.name);
      }
    }
  };

  const removeSavedLocation = (lat, lon) => {
    setSavedLocations((prev) => prev.filter((item) => item.lat !== lat || item.lon !== lon));
  };

  // Derive scene config from active weather data
  const currentSceneConfig = weatherData
    ? getWeatherConfig(weatherData.current.code, weatherData.current.isDay)
    : getWeatherConfig(0, 1);

  return (
    <WeatherContext.Provider
      value={{
        unit,
        toggleUnit,
        convertTemp,
        activeLocation,
        setActiveLocation,
        weatherData,
        loading,
        error,
        isTransitioning,
        savedLocations,
        addSavedLocation,
        removeSavedLocation,
        currentSceneConfig,
        refreshWeather: () => loadWeather(activeLocation),
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => useContext(WeatherContext);
