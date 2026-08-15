import React from 'react';
import { AlertTriangle, ShieldAlert, Wind, Zap } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';

export const WeatherAlerts = () => {
  const { weatherData } = useWeather();

  if (!weatherData) return null;

  const current = weatherData.current;
  const alerts = [];

  if (current.code >= 95) {
    alerts.push({
      title: 'Thunderstorm & Lightning Warning',
      message: 'Severe electrical activity detected in your area. Seek shelter indoors immediately.',
      level: 'high',
      icon: Zap,
    });
  } else if (current.windSpeed >= 35) {
    alerts.push({
      title: 'High Wind Gust Advisory',
      message: `Strong winds up to ${Math.round(current.windSpeed)} km/h. Secure outdoor items.`,
      level: 'medium',
      icon: Wind,
    });
  } else if (current.uvIndex >= 8) {
    alerts.push({
      title: 'Extreme UV Radiation Warning',
      message: 'UV Index is dangerously elevated. Limit direct sun exposure and wear SPF 50+ protection.',
      level: 'medium',
      icon: AlertTriangle,
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-2 z-20 relative">
      {alerts.map((alert, idx) => {
        const IconComponent = alert.icon || ShieldAlert;
        return (
          <div
            key={idx}
            className="glass-panel p-4 rounded-2xl border border-rose-500/40 bg-rose-500/15 text-rose-100 flex items-start gap-3.5 shadow-xl animate-pulse"
          >
            <IconComponent className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                {alert.title}
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500 text-white">
                  Active Warning
                </span>
              </h4>
              <p className="text-xs text-rose-100/90 mt-0.5">{alert.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
