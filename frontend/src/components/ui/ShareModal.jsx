import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Check, MapPin } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';

export const ShareModal = ({ isOpen, onClose }) => {
  const { weatherData, activeLocation, convertTemp, unit, currentSceneConfig } = useWeather();
  const [copied, setCopied] = useState(false);

  if (!weatherData) return null;

  const current = weatherData.current;
  const temp = convertTemp(current.temp);

  const shareText = `☀️ Atmosphere 3D Weather Update for ${activeLocation.name}: ${temp}°${unit}, ${currentSceneConfig.wmo.label}. Humidity: ${current.humidity}%, Wind: ${Math.round(current.windSpeed)} km/h.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/25 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Share Weather Card</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/20 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Screenshot Style Card Preview */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-panel p-6 rounded-2xl border border-white/30 bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-slate-900/60 shadow-2xl text-center relative overflow-hidden mb-5 cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1.5 text-xs text-blue-300 font-semibold mb-2">
                <MapPin className="w-3.5 h-3.5" />
                {activeLocation.name}, {activeLocation.country}
              </div>

              <div className="text-6xl font-black text-white drop-shadow-md my-2">
                {temp}°{unit}
              </div>

              <p className="text-base font-bold text-white">{currentSceneConfig.wmo.label}</p>
              <p className="text-xs text-slate-300 mt-1">{currentSceneConfig.wmo.description}</p>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/15 text-xs text-slate-200">
                <div>Humidity: <span className="font-bold text-white">{current.humidity}%</span></div>
                <div>Wind: <span className="font-bold text-white">{Math.round(current.windSpeed)} km/h</span></div>
              </div>
            </motion.div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCopy}
              className="w-full py-3 px-4 rounded-xl glass-pill hover:bg-white/25 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all border border-white/30"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Summary Copied to Clipboard!' : 'Copy Summary Card'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
