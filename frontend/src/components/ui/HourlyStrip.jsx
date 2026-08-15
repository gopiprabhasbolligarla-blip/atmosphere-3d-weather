import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Clock } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { WMO_CODES } from '../../services/wmoCodes';

export const HourlyStrip = () => {
  const { weatherData, convertTemp } = useWeather();

  if (!weatherData || !weatherData.hourly) return null;

  const hourly = weatherData.hourly;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-2 z-20 relative">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-panel p-5 rounded-3xl border border-white/15"
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            24-Hour Forecast & Precipitation Timeline
          </h3>
          <span className="text-xs text-slate-300">Hourly Telemetry</span>
        </div>

        {/* Horizontal Scrollable Carousel with Framer Motion */}
        <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-white/20">
          {hourly.map((item, idx) => {
            const timeObj = new Date(item.time);
            const hourFormatted = idx === 0 ? 'Now' : timeObj.toLocaleTimeString('en-US', { hour: 'numeric' });
            const wmo = WMO_CODES[item.code] || WMO_CODES[0];
            const tempVal = convertTemp(item.temp);
            const pop = item.pop || 0;

            return (
              <motion.div
                key={`${item.time}-${idx}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.4) }}
                whileHover={{ scale: 1.06, y: -4 }}
                className="glass-pill flex-shrink-0 w-24 p-3.5 rounded-2xl flex flex-col items-center justify-between text-center gap-2 border border-white/10 hover:border-white/30 cursor-pointer shadow-lg"
              >
                <span className="text-xs font-semibold text-slate-300">{hourFormatted}</span>

                <span className="text-lg font-extrabold text-white">{tempVal}°</span>

                <span className="text-[10px] font-medium text-slate-300 truncate w-full">
                  {wmo.label.split(' ')[0]}
                </span>

                <div className="w-full mt-1">
                  <div className="flex items-center justify-between text-[10px] text-blue-300 font-semibold mb-1">
                    <Droplets className="w-2.5 h-2.5" />
                    <span>{pop}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(pop, 5)}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.02 }}
                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
