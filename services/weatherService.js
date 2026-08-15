/**
 * Core Weather Service
 * Interacts with Open-Meteo Weather API to fetch real-time forecasts, air quality, and hourly data.
 */

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

/**
 * Fetch Current & Forecast Weather Data
 */
export async function getWeatherData(latitude, longitude) {
  const url = `${BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,weather_code,pressure_msl,cloud_cover,visibility,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch weather data');
  return res.json();
}

/**
 * Search Location Geocoding
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding search failed');
  const data = await res.json();
  return data.results || [];
}

/**
 * Fetch Air Quality Metrics
 */
export async function getAirQualityData(latitude, longitude) {
  const url = `${AIR_QUALITY_URL}?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Air quality fetch failed');
  return res.json();
}
