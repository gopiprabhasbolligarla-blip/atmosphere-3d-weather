import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Compass, Bookmark, X, Check, User, LogOut, LogIn, Smartphone } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useAuth } from '../../context/AuthContext';
import { searchLocations, reverseGeocode } from '../../services/openMeteoApi';

export const Header = ({ onOpenSaved, onOpenShare }) => {
  const { unit, toggleUnit, activeLocation, setActiveLocation, addSavedLocation, savedLocations } = useWeather();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        const list = await searchLocations(query);
        setResults(list);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = (loc) => {
    const selected = {
      name: loc.name,
      country: loc.country || loc.admin1 || '',
      lat: loc.latitude,
      lon: loc.longitude,
    };
    setActiveLocation(selected);
    setQuery('');
    setShowDropdown(false);
  };

  const [locLoading, setLocLoading] = useState(false);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your web browser.');
      return;
    }

    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const info = await reverseGeocode(lat, lon);
          setActiveLocation({
            name: info.city || info.name || 'Current Location',
            country: info.country || '',
            lat,
            lon,
          });
        } catch (err) {
          console.error('Failed to reverse geocode GPS location:', err);
        } finally {
          setLocLoading(false);
        }
      },
      (error) => {
        setLocLoading(false);
        console.warn('Geolocation permission or accuracy error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          alert('Location permission was denied. Please allow location permissions in your browser address bar icon.');
        } else {
          alert('Unable to detect your precise GPS location. Please try again or search your city above.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const isCurrentSaved = savedLocations.some(
    (loc) => loc.lat === activeLocation.lat && loc.lon === activeLocation.lon
  );

  return (
    <header className="relative z-30 w-full max-w-7xl mx-auto px-4 pt-6 pb-2">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Location Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl glass-pill flex items-center justify-center text-amber-400 shadow-lg">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Atmosphere 3D
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30 font-normal">
                Live
              </span>
            </h1>
            <p className="text-xs text-slate-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              {activeLocation.name}
              {activeLocation.country ? `, ${activeLocation.country}` : ''}
            </p>
          </div>
        </div>

        {/* Center Search Input Bar */}
        <div className="relative w-full max-w-md" ref={dropdownRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any city or landmark..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl glass-input text-sm transition-all shadow-inner"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 p-1 hover:bg-white/20 rounded-full text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 py-2 glass-panel rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-50">
              {isSearching ? (
                <div className="px-4 py-3 text-xs text-slate-300 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching global database...
                </div>
              ) : results.length > 0 ? (
                results.map((item, idx) => (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => handleSelectLocation(item)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/15 flex items-center justify-between text-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-slate-400">
                        {item.admin1 ? `${item.admin1}, ` : ''}
                        {item.country}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-slate-400">No matching cities found</div>
              )}
            </div>
          )}
        </div>

        {/* Right Controls Bar */}
        <div className="flex items-center gap-2">
          {/* User Account / Sign In Trigger */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl glass-pill hover:bg-white/20 text-white transition-all border border-blue-400/40"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-7 h-7 rounded-xl object-cover border border-white/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <span className="text-xs font-semibold max-w-[80px] truncate hidden sm:inline">
                  {user?.name || user?.mobile || 'Account'}
                </span>
              </button>

              {/* User dropdown popup */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 glass-panel rounded-2xl p-2 shadow-2xl z-50 border border-white/20 animate-fade-in">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-bold text-white truncate">{user?.name || 'Logged In'}</p>
                    <p className="text-[10px] text-slate-300 truncate">{user?.email || user?.mobile}</p>
                    <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 uppercase font-semibold">
                      Via {user?.authMethod || 'Mobile OTP'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-300 hover:bg-red-500/20 rounded-xl flex items-center gap-2 transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-2 rounded-xl glass-pill hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 border border-blue-400/40 shadow-sm transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="hidden md:flex px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs items-center gap-1 shadow-md transition-all"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* GPS Location Button */}
          <button
            onClick={handleUseMyLocation}
            disabled={locLoading}
            title="Use my current GPS location"
            className="p-2.5 rounded-xl glass-pill hover:bg-white/20 text-slate-200 transition-all flex items-center gap-1.5 text-xs font-medium disabled:opacity-60"
          >
            {locLoading ? (
              <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 text-emerald-400" />
            )}
            <span className="hidden sm:inline">{locLoading ? 'Locating...' : 'My Location'}</span>
          </button>

          {/* Bookmark / Save Location */}
          <button
            onClick={() => addSavedLocation(activeLocation, user)}
            title={isCurrentSaved ? 'Location Pinned' : 'Pin location'}
            className={`p-2.5 rounded-xl glass-pill transition-all ${
              isCurrentSaved ? 'bg-amber-500/30 text-amber-300 border-amber-400/40' : 'hover:bg-white/20 text-slate-200'
            }`}
          >
            {isCurrentSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>

          {/* Saved Cities Drawer Toggle */}
          <button
            onClick={onOpenSaved}
            className="px-3 py-2 rounded-xl glass-pill hover:bg-white/20 text-slate-200 text-xs font-medium transition-all"
          >
            Cities ({savedLocations.length})
          </button>

          {/* Share Modal Trigger */}
          <button
            onClick={onOpenShare}
            className="px-3 py-2 rounded-xl glass-pill hover:bg-white/20 text-slate-200 text-xs font-medium transition-all"
          >
            Share
          </button>

          {/* °C / °F Unit Switcher */}
          <button
            onClick={toggleUnit}
            className="px-3.5 py-2 rounded-xl glass-pill hover:bg-white/25 text-white font-semibold text-xs transition-all border border-white/30"
          >
            °{unit}
          </button>
        </div>
      </div>
    </header>
  );
};
