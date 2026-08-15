import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Droplets, Sun, Eye, Gauge, ShieldAlert, Activity } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';

export const WeatherMetrics = () => {
  const { weatherData } = useWeather();

  if (!weatherData) return null;

  const current = weatherData.current;
  const aqi = weatherData.aqi;

  const getAqiLevel = (val) => {
    if (val <= 50) return { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (val <= 100) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    if (val <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { label: 'Unhealthy', color: 'text-rose-500', bg: 'bg-rose-500/20' };
  };

  const aqiInfo = getAqiLevel(aqi.usAqi);

  const getUvLevel = (val) => {
    if (val <= 2) return 'Low';
    if (val <= 5) return 'Moderate';
    if (val <= 7) return 'High';
    if (val <= 10) return 'Very High';
    return 'Extreme';
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.06,
        duration: 0.4,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-panel p-5 rounded-3xl border border-white/15 h-full flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Atmospheric Telemetry
        </h3>
        <span className="text-xs text-slate-300">Live Sensors</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Air Quality Index (AQI) */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.05, y: -4 }}
          className="glass-pill p-4 rounded-2xl flex flex-col justify-between cursor-pointer border border-white/10 hover:border-white/30 shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Air Quality</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-white">{aqi.usAqi}</span>
            <span className="text-xs font-semibold ml-1 text-slate-300">AQI</span>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-block w-max ${aqiInfo.bg} ${aqiInfo.color}`}>
            {aqiInfo.label}
          </span>
        </motion.div>

        {/* Wind Speed & Gusts */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.05, y: -4 }}
          className="glass-pill p-4 rounded-2xl flex flex-col justify-between cursor-pointer border border-white/10 hover:border-white/30 shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Wind Speed</span>
            <Wind className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-white">{Math.round(current.windSpeed)}</span>
            <span className="text-xs font-semibold ml-1 text-slate-300">km/h</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Gusts up to {Math.round(current.windGusts || current.windSpeed * 1.3)} km/h
          </p>
        </motion.div>

        {/* UV Index */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.05, y: -4 }}
          className="glass-pill p-4 rounded-2xl flex flex-col justify-between cursor-pointer border border-white/10 hover:border-white/30 shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>UV Index</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-white">{Math.round(current.uvIndex)}</span>
            <span className="text-xs font-semibold ml-1 text-slate-300">/ 12</span>
          </div>
          <span className="text-[11px] font-semibold text-amber-300">
            {getUvLevel(current.uvIndex)} Protection
          </span>
        </motion.div>

        {/* Humidity */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.05, y: -4 }}
          className="glass-pill p-4 rounded-2xl flex flex-col justify-between cursor-pointer border border-white/10 hover:border-white/30 shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Humidity</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-white">{current.humidity}%</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Dew point ~{Math.round(current.temp - (100 - current.humidity) / 5)}°C
          </p>
        </motion.div>

        {/* Barometric Pressure */}
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.05, y: -4 }}
          className="glass-pill p-4 rounded-2xl flex flex-col justify-between cursor-pointer border border-white/10 hover:border-white/30 shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Pressure</span>
            <Gauge className="w-4 h-4 text-purple-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-white">{Math.round(current.pressure)}</span>
            <span className="text-xs font-semibold ml-1 text-slate-300">hPa</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">Standard Atmospheric</span>
        </motion.div>

        {/* Visibility */}
        <motion.div
          custom={5}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.05, y: -4 }}
          className="glass-pill p-4 rounded-2xl flex flex-col justify-between cursor-pointer border border-white/10 hover:border-white/30 shadow-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Visibility</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-white">{current.visibility.toFixed(1)}</span>
            <span className="text-xs font-semibold ml-1 text-slate-300">km</span>
          </div>
          <span className="text-[11px] text-slate-300">Clear horizon distance</span>
        </motion.div>
      </div>
    </motion.div>
  );
};
