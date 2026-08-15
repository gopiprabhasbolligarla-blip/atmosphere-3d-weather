/**
 * WMO Weather Interpretation Codes (WW)
 * Maps Open-Meteo weathercode values into UI descriptions and 3D Scene configurations.
 */

export const WMO_CODES = {
  0: {
    label: 'Clear Sky',
    type: 'clear',
    icon: 'Sun',
    nightIcon: 'Moon',
    description: 'Completely clear skies',
  },
  1: {
    label: 'Mainly Clear',
    type: 'clear',
    icon: 'SunDim',
    nightIcon: 'Moon',
    description: 'Mostly clear with minimal clouds',
  },
  2: {
    label: 'Partly Cloudy',
    type: 'partly_cloudy',
    icon: 'CloudSun',
    nightIcon: 'CloudMoon',
    description: 'Scattered clouds throughout the sky',
  },
  3: {
    label: 'Overcast',
    type: 'overcast',
    icon: 'Cloud',
    nightIcon: 'Cloud',
    description: 'Dense gray cloud cover',
  },
  45: {
    label: 'Foggy',
    type: 'fog',
    icon: 'CloudFog',
    nightIcon: 'CloudFog',
    description: 'Low visibility due to fog',
  },
  48: {
    label: 'Depositing Rime Fog',
    type: 'fog',
    icon: 'CloudFog',
    nightIcon: 'CloudFog',
    description: 'Freezing atmospheric fog',
  },
  51: {
    label: 'Light Drizzle',
    type: 'rain',
    icon: 'CloudDrizzle',
    nightIcon: 'CloudDrizzle',
    description: 'Gentle misty drizzle',
  },
  53: {
    label: 'Moderate Drizzle',
    type: 'rain',
    icon: 'CloudDrizzle',
    nightIcon: 'CloudDrizzle',
    description: 'Steady light drizzle',
  },
  55: {
    label: 'Dense Drizzle',
    type: 'rain',
    icon: 'CloudRain',
    nightIcon: 'CloudRain',
    description: 'Heavy soaking drizzle',
  },
  56: {
    label: 'Light Freezing Drizzle',
    type: 'snow',
    icon: 'CloudSnow',
    nightIcon: 'CloudSnow',
    description: 'Icy cold drizzle',
  },
  57: {
    label: 'Dense Freezing Drizzle',
    type: 'snow',
    icon: 'CloudSnow',
    nightIcon: 'CloudSnow',
    description: 'Heavy icy freezing drizzle',
  },
  61: {
    label: 'Slight Rain',
    type: 'rain',
    icon: 'CloudRain',
    nightIcon: 'CloudRain',
    description: 'Light continuous rainfall',
  },
  63: {
    label: 'Moderate Rain',
    type: 'rain',
    icon: 'CloudRain',
    nightIcon: 'CloudRain',
    description: 'Steady rain shower',
  },
  65: {
    label: 'Heavy Rain',
    type: 'rain',
    icon: 'CloudRainWind',
    nightIcon: 'CloudRainWind',
    description: 'Heavy pouring rainfall',
  },
  66: {
    label: 'Freezing Rain',
    type: 'snow',
    icon: 'CloudHail',
    nightIcon: 'CloudHail',
    description: 'Rain freezing upon contact',
  },
  67: {
    label: 'Heavy Freezing Rain',
    type: 'snow',
    icon: 'CloudHail',
    nightIcon: 'CloudHail',
    description: 'Severe freezing rainfall',
  },
  71: {
    label: 'Slight Snowfall',
    type: 'snow',
    icon: 'CloudSnow',
    nightIcon: 'CloudSnow',
    description: 'Light fluttering snowflakes',
  },
  73: {
    label: 'Moderate Snowfall',
    type: 'snow',
    icon: 'CloudSnow',
    nightIcon: 'CloudSnow',
    description: 'Steady snowfall',
  },
  75: {
    label: 'Heavy Snowfall',
    type: 'snow',
    icon: 'Snowflake',
    nightIcon: 'Snowflake',
    description: 'Heavy snow flurry',
  },
  77: {
    label: 'Snow Grains',
    type: 'snow',
    icon: 'Snowflake',
    nightIcon: 'Snowflake',
    description: 'Small icy snow grains',
  },
  80: {
    label: 'Slight Rain Showers',
    type: 'rain',
    icon: 'CloudRain',
    nightIcon: 'CloudRain',
    description: 'Passing light showers',
  },
  81: {
    label: 'Moderate Rain Showers',
    type: 'rain',
    icon: 'CloudRain',
    nightIcon: 'CloudRain',
    description: 'Passing moderate rain',
  },
  82: {
    label: 'Violent Rain Showers',
    type: 'rain',
    icon: 'CloudRainWind',
    nightIcon: 'CloudRainWind',
    description: 'Torrential downpour',
  },
  85: {
    label: 'Slight Snow Showers',
    type: 'snow',
    icon: 'CloudSnow',
    nightIcon: 'CloudSnow',
    description: 'Passing light snow flurries',
  },
  86: {
    label: 'Heavy Snow Showers',
    type: 'snow',
    icon: 'Snowflake',
    nightIcon: 'Snowflake',
    description: 'Intense snow blizzards',
  },
  95: {
    label: 'Thunderstorm',
    type: 'storm',
    icon: 'CloudLightning',
    nightIcon: 'CloudLightning',
    description: 'Thunderstorm with electrical lightning',
  },
  96: {
    label: 'Thunderstorm with Hail',
    type: 'storm',
    icon: 'CloudLightning',
    nightIcon: 'CloudLightning',
    description: 'Severe storm with hail',
  },
  99: {
    label: 'Heavy Hailstorm',
    type: 'storm',
    icon: 'CloudLightning',
    nightIcon: 'CloudLightning',
    description: 'Violent storm with heavy hail',
  },
};

export const getWeatherConfig = (code = 0, isDay = 1) => {
  const wmo = WMO_CODES[code] || WMO_CODES[0];

  // Base 3D Scene parameters
  let scene = {
    code,
    label: wmo.label,
    type: wmo.type,
    isDay: Boolean(isDay),
    skyTop: isDay ? '#1e3a8a' : '#050b14',
    skyBottom: isDay ? '#60a5fa' : '#0f172a',
    sunColor: '#ffb703',
    sunIntensity: isDay ? 1.5 : 0.05,
    ambientColor: isDay ? '#ffffff' : '#1e293b',
    cloudCount: 0,
    cloudOpacity: 0.8,
    precipType: 'none', // 'none' | 'rain' | 'snow'
    precipSpeed: 1.0,
    precipDensity: 0,
    hasLightning: false,
    fogDensity: 0,
  };

  switch (wmo.type) {
    case 'clear':
      scene.skyTop = isDay ? '#2563eb' : '#030712';
      scene.skyBottom = isDay ? '#93c5fd' : '#111827';
      scene.cloudCount = isDay ? 3 : 2;
      scene.cloudOpacity = 0.4;
      break;

    case 'partly_cloudy':
      scene.skyTop = isDay ? '#1d4ed8' : '#090d16';
      scene.skyBottom = isDay ? '#bfdbfe' : '#1e293b';
      scene.cloudCount = 12;
      scene.cloudOpacity = 0.75;
      break;

    case 'overcast':
      scene.skyTop = isDay ? '#475569' : '#090d16';
      scene.skyBottom = isDay ? '#94a3b8' : '#1e293b';
      scene.cloudCount = 28;
      scene.cloudOpacity = 0.95;
      scene.sunIntensity = isDay ? 0.4 : 0.02;
      break;

    case 'fog':
      scene.skyTop = isDay ? '#64748b' : '#0f172a';
      scene.skyBottom = isDay ? '#cbd5e1' : '#334155';
      scene.cloudCount = 15;
      scene.fogDensity = 0.035;
      scene.sunIntensity = isDay ? 0.3 : 0.01;
      break;

    case 'rain':
      scene.skyTop = isDay ? '#1e293b' : '#020617';
      scene.skyBottom = isDay ? '#475569' : '#0f172a';
      scene.cloudCount = 35;
      scene.cloudOpacity = 0.95;
      scene.precipType = 'rain';
      scene.precipDensity = code >= 65 || code === 82 ? 1500 : 800;
      scene.precipSpeed = code >= 65 ? 2.5 : 1.5;
      scene.sunIntensity = isDay ? 0.25 : 0.01;
      break;

    case 'snow':
      scene.skyTop = isDay ? '#334155' : '#030712';
      scene.skyBottom = isDay ? '#94a3b8' : '#1e293b';
      scene.cloudCount = 30;
      scene.precipType = 'snow';
      scene.precipDensity = code >= 75 || code === 86 ? 1200 : 600;
      scene.precipSpeed = 0.8;
      scene.sunIntensity = isDay ? 0.5 : 0.02;
      scene.ambientColor = '#e2e8f0';
      break;

    case 'storm':
      scene.skyTop = '#090d16';
      scene.skyBottom = '#1e1b4b';
      scene.cloudCount = 45;
      scene.cloudOpacity = 0.98;
      scene.precipType = 'rain';
      scene.precipDensity = 2000;
      scene.precipSpeed = 3.2;
      scene.hasLightning = true;
      scene.sunIntensity = 0.1;
      break;

    default:
      break;
  }

  return { wmo, scene };
};
