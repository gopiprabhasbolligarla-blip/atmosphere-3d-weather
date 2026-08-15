import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Droplets } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { WMO_CODES } from '../../services/wmoCodes';

export const DailyForecast = () => {
  const { weatherData, convertTemp } = useWeather();

  if (!weatherData || !weatherData.daily) return null;

  const daily = weatherData.daily;

  let globalMin = 100;
  let globalMax = -100;
  daily.forEach((d) => {
    if (d.tempMin < globalMin) globalMin = d.tempMin;
    if (d.tempMax > globalMax) globalMax = d.tempMax;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-panel p-5 rounded-3xl border border-white/15 h-full flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          7-Day Forecast
        </h3>
        <span className="text-xs text-slate-300">Daily Range</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {daily.map((day, idx) => {
          const dateObj = new Date(day.date);
          const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
          const wmo = WMO_CODES[day.code] || WMO_CODES[0];

          const min = convertTemp(day.tempMin);
          const max = convertTemp(day.tempMax);

          const leftPercent = Math.max(0, ((day.tempMin - globalMin) / (globalMax - globalMin || 1)) * 100);
          const rightPercent = Math.min(100, ((day.tempMax - globalMin) / (globalMax - globalMin || 1)) * 100);
          const barWidth = Math.max(10, rightPercent - leftPercent);

          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              className="glass-pill px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs transition-all cursor-pointer"
            >
              <div className="w-24">
                <span className="font-bold text-white block">{dayName}</span>
                <span className="text-[10px] text-slate-400">{dateFormatted}</span>
              </div>

              <div className="flex-1 min-w-[100px] text-slate-200 font-medium">
                {wmo.label}
              </div>

              {day.popMax > 20 && (
                <div className="flex items-center gap-1 text-blue-300 font-semibold text-[11px] w-12">
                  <Droplets className="w-3 h-3 text-blue-400" />
                  <span>{day.popMax}%</span>
                </div>
              )}

              <div className="flex items-center gap-2 w-36 sm:w-44">
                <span className="w-8 text-right font-medium text-blue-200">{min}°</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.7, delay: 0.2 + idx * 0.05 }}
                    className="absolute h-full bg-gradient-to-r from-blue-400 via-amber-300 to-rose-400 rounded-full"
                    style={{
                      left: `${leftPercent}%`,
                    }}
                  />
                </div>
                <span className="w-8 font-bold text-amber-300">{max}°</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
