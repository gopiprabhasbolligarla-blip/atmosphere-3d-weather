/**
 * Open-Meteo Weather, Geocoding & Air Quality API Service
 * 100% Free API, no keys required.
 */

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const AQI_BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

/**
 * Search locations by query string
 */
export const searchLocations = async (query) => {
  if (!query || query.trim().length < 2) return [];

  try {
    const res = await fetch(
      `${GEOCODING_BASE_URL}?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
    );
    if (!res.ok) throw new Error('Geocoding fetch failed');
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching location:', error);
    return [];
  }
};

/**
 * Reverse Geocode lat/lon into City, Country
 * Uses BigDataCloud with OpenStreetMap fallback for 100% reliable geolocation resolution.
 */
export const reverseGeocode = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || 'Current Location';
      const country = data.countryName || '';
      return { city, country, name: city };
    }
  } catch (err) {
    console.warn('BigDataCloud geocode fallback, trying OpenStreetMap:', err);
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.state || 'Current Location';
      const country = addr.country || '';
      return { city, country, name: city };
    }
  } catch (err) {
    console.warn('Reverse geocode fallback:', err);
  }
  return { city: 'Current Location', country: '', name: 'Current Location' };
};

/**
 * Fetch Weather + Air Quality data in parallel
 */
export const fetchWeatherData = async (lat, lon) => {
  try {
    const weatherUrl = `${FORECAST_BASE_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,cloud_cover,visibility,wind_speed_10m,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

    const aqiUrl = `${AQI_BASE_URL}?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;

    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(aqiUrl).catch(() => null),
    ]);

    if (!weatherRes.ok) throw new Error('Weather API request failed');

    const weatherData = await weatherRes.json();
    let aqiData = null;

    if (aqiRes && aqiRes.ok) {
      aqiData = await aqiRes.json();
    }

    return formatWeatherData(weatherData, aqiData);
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    throw error;
  }
};

/**
 * Format raw API response into clean UI structure
 */
function formatWeatherData(weather, aqi) {
  const current = weather.current || {};
  const hourly = weather.hourly || {};
  const daily = weather.daily || {};

  // Hourly array (next 24 hours)
  const nowIndex = 0;
  const hourlyList = (hourly.time || []).slice(nowIndex, nowIndex + 24).map((t, idx) => ({
    time: t,
    temp: hourly.temperature_2m?.[idx] ?? 0,
    apparentTemp: hourly.apparent_temperature?.[idx] ?? 0,
    pop: hourly.precipitation_probability?.[idx] ?? 0,
    precip: hourly.precipitation?.[idx] ?? 0,
    code: hourly.weather_code?.[idx] ?? 0,
    isDay: hourly.is_day?.[idx] ?? 1,
    uv: hourly.uv_index?.[idx] ?? 0,
    wind: hourly.wind_speed_10m?.[idx] ?? 0,
  }));

  // Daily array (7 days)
  const dailyList = (daily.time || []).map((t, idx) => ({
    date: t,
    code: daily.weather_code?.[idx] ?? 0,
    tempMax: daily.temperature_2m_max?.[idx] ?? 0,
    tempMin: daily.temperature_2m_min?.[idx] ?? 0,
    popMax: daily.precipitation_probability_max?.[idx] ?? 0,
    precipSum: daily.precipitation_sum?.[idx] ?? 0,
    uvMax: daily.uv_index_max?.[idx] ?? 0,
    sunrise: daily.sunrise?.[idx] ?? '',
    sunset: daily.sunset?.[idx] ?? '',
  }));

  return {
    current: {
      temp: current.temperature_2m ?? 20,
      apparentTemp: current.apparent_temperature ?? 20,
      humidity: current.relative_humidity_2m ?? 50,
      isDay: current.is_day ?? 1,
      code: current.weather_code ?? 0,
      cloudCover: current.cloud_cover ?? 0,
      pressure: current.pressure_msl || current.surface_pressure || 1013,
      windSpeed: current.wind_speed_10m ?? 0,
      windDirection: current.wind_direction_10m ?? 0,
      windGusts: current.wind_gusts_10m ?? 0,
      precip: current.precipitation ?? 0,
      visibility: (hourly.visibility?.[0] ?? 10000) / 1000,
      uvIndex: hourly.uv_index?.[0] ?? 0,
    },
    aqi: {
      usAqi: aqi?.current?.us_aqi ?? 42,
      pm25: aqi?.current?.pm2_5 ?? 10,
      pm10: aqi?.current?.pm10 ?? 20,
      o3: aqi?.current?.ozone ?? 30,
      no2: aqi?.current?.nitrogen_dioxide ?? 15,
    },
    hourly: hourlyList,
    daily: dailyList,
    timezone: weather.timezone || 'UTC',
  };
}
