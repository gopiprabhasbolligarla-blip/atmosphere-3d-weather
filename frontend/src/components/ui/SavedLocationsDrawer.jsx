import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Trash2, CheckCircle2 } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';

export const SavedLocationsDrawer = ({ isOpen, onClose }) => {
  const { savedLocations, setActiveLocation, activeLocation, removeSavedLocation } = useWeather();

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
            className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-white/25 shadow-2xl relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Pinned Locations</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/20 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Location List */}
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {savedLocations.length > 0 ? (
                savedLocations.map((loc, idx) => {
                  const isActive = loc.lat === activeLocation.lat && loc.lon === activeLocation.lon;
                  return (
                    <motion.div
                      key={`${loc.lat}-${loc.lon}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className={`glass-pill p-4 rounded-2xl flex items-center justify-between transition-all ${
                        isActive ? 'border-amber-400/60 bg-amber-500/20' : 'hover:bg-white/15'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setActiveLocation(loc);
                          onClose();
                        }}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">{loc.name}</span>
                          {isActive && (
                            <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Active
                            </span>
                          )}
                        </div>
                        {loc.country && <span className="text-xs text-slate-400">{loc.country}</span>}
                      </button>

                      <button
                        onClick={() => removeSavedLocation(loc.lat, loc.lon)}
                        title="Remove from saved cities"
                        className="p-2 hover:bg-rose-500/30 text-rose-300 rounded-xl transition-colors ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">No saved cities yet.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
