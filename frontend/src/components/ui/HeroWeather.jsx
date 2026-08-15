import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { getFeelsLikeReasoning } from '../../utils/feelsLikeLogic';

export const HeroWeather = () => {
  const { weatherData, activeLocation, unit, convertTemp, currentSceneConfig, loading, refreshWeather } = useWeather();

  if (loading || !weatherData) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center min-h-[220px]"
        >
          <div className="w-12 h-12 border-4 border-blue-400/40 border-t-blue-400 rounded-full animate-spin mb-4" />
          <p className="text-sm text-slate-300">Fetching live atmospheric telemetry...</p>
        </motion.div>
      </div>
    );
  }

  const current = weatherData.current;
  const today = weatherData.daily?.[0] || {};
  const temp = convertTemp(current.temp);
  const apparentTemp = convertTemp(current.apparentTemp);
  const highTemp = convertTemp(today.tempMax);
  const lowTemp = convertTemp(today.tempMin);

  const feelsLikeReason = getFeelsLikeReasoning(
    current.temp,
    current.apparentTemp,
    current.humidity,
    current.windSpeed,
    current.uvIndex
  );

  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 z-20 relative">
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden backdrop-blur-xl border border-white/20 shadow-2xl"
      >
        {/* Glow Aura */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.45, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full pointer-events-none blur-3xl"
          style={{
            background: current.isDay
              ? 'radial-gradient(circle, rgba(251,191,36,0.8) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(96,165,250,0.8) 0%, transparent 70%)',
          }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Main Temp & Condition */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-200 uppercase mb-1">
              <span>{dateString}</span>
              <span>•</span>
              <span>{timeString}</span>
              <motion.button
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                onClick={refreshWeather}
                title="Refresh Weather Data"
                className="ml-2 p-1 hover:bg-white/20 rounded-full text-slate-300"
              >
                <RefreshCw className="w-3 h-3" />
              </motion.button>
            </div>

            <div className="flex items-baseline gap-4">
              <motion.span
                key={temp}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-6xl sm:text-8xl font-black tracking-tighter text-white drop-shadow-lg"
              >
                {temp}°
              </motion.span>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow">
                  {currentSceneConfig.wmo.label}
                </h2>
                <p className="text-sm text-slate-200 font-medium">
                  {currentSceneConfig.wmo.description}
                </p>
              </div>
            </div>
          </div>

          {/* High / Low & Feels Like Card */}
          <div className="flex flex-col gap-3 min-w-[280px]">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="glass-pill px-4 py-2 rounded-2xl flex items-center gap-2 text-sm font-semibold text-amber-300"
              >
                <ArrowUp className="w-4 h-4" />
                <span>High {highTemp}°{unit}</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="glass-pill px-4 py-2 rounded-2xl flex items-center gap-2 text-sm font-semibold text-blue-300"
              >
                <ArrowDown className="w-4 h-4" />
                <span>Low {lowTemp}°{unit}</span>
              </motion.div>
            </div>

            {/* Feels Like Reasoning Pill */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-pill px-4 py-3 rounded-2xl flex items-start gap-2.5 text-xs text-slate-100 border border-white/20 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-bold text-white block">
                  Feels like {apparentTemp}°{unit}
                </span>
                <span className="text-slate-200 opacity-90">{feelsLikeReason}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
