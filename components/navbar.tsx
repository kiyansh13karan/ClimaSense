'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Search, Moon, Sun, Droplet, FlaskConical, Wifi, X, LocateFixed, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/use-debounce';
import type { GeolocationStatus } from '@/lib/types';

interface NavbarProps {
  onLocationSearch?: (location: string) => void;
  onCoordsDetected?: (lat: number, lng: number, city: string) => void;
  isDemoMode?: boolean;
  onToggleDemoMode?: () => void;
  geoStatus?: GeolocationStatus;
  onRequestGeo?: () => void;
}

const SUGGESTED_LOCATIONS = ['Houston', 'Miami', 'New York', 'Seattle', 'London'];

export function Navbar({
  onLocationSearch,
  onCoordsDetected,
  isDemoMode = true,
  onToggleDemoMode,
  geoStatus = 'idle',
  onRequestGeo,
}: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => { setMounted(true); }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onLocationSearch?.(searchValue.trim());
      setSearchValue('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (location: string) => {
    onLocationSearch?.(location);
    setSearchValue('');
    setShowSuggestions(false);
  };

  const filteredSuggestions = SUGGESTED_LOCATIONS.filter(loc =>
    debouncedSearch.length === 0 || loc.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const geoIsLoading = geoStatus === 'requesting';
  const geoIsActive = geoStatus === 'granted';
  const geoDenied = geoStatus === 'denied' || geoStatus === 'unavailable';

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-xl bg-background/80 dark:bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <motion.a
            href="/"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 shrink-0"
          >
            <img src="/Logo.png" alt="ClimaSense" className="w-8 h-8 rounded-lg object-contain" />
            <span className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:block">
              ClimaSense
            </span>
          </motion.a>

          {/* Search + Geo */}
          <motion.div
            ref={searchRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 max-w-md relative flex items-center gap-2"
          >
            {/* Search input */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search city..."
                  className="w-full px-4 py-2 pl-9 pr-8 rounded-lg bg-muted/50 border border-border/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  aria-label="Search location"
                  autoComplete="off"
                />
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => { setSearchValue(''); setShowSuggestions(false); }}
                    className="absolute right-2.5 top-2.5"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                )}
              </div>
            </form>

            {/* Geolocation button */}
            {onRequestGeo && (
              <button
                onClick={onRequestGeo}
                disabled={geoIsLoading || geoDenied}
                title={
                  geoDenied
                    ? 'Location permission denied'
                    : geoIsActive
                    ? 'Using your location'
                    : 'Use my location'
                }
                className={`p-2 rounded-lg border transition-all shrink-0 ${
                  geoIsActive
                    ? 'bg-primary/10 border-primary/25 text-primary'
                    : geoDenied
                    ? 'bg-muted/30 border-border/30 text-muted-foreground/30 cursor-not-allowed'
                    : 'bg-muted/40 border-border/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:border-border/70'
                }`}
                aria-label="Use my location"
              >
                {geoIsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LocateFixed className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-1.5 left-0 right-10 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
                >
                  {filteredSuggestions.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleSuggestionClick(loc)}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors text-left"
                    >
                      <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      {loc}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 shrink-0"
          >
            {/* Demo / Live toggle */}
            {onToggleDemoMode && (
              <button
                onClick={onToggleDemoMode}
                title={isDemoMode ? 'Switch to Live Data' : 'Switch to Demo Mode'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isDemoMode
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'
                    : 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
                }`}
              >
                {isDemoMode
                  ? <FlaskConical className="w-3.5 h-3.5" />
                  : <Wifi className="w-3.5 h-3.5" />
                }
                <span className="hidden sm:block">{isDemoMode ? 'Demo' : 'Live'}</span>
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Toggle theme"
            >
              <motion.div
                key={theme}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.25 }}
              >
                {mounted ? (
                  theme === 'dark'
                    ? <Sun className="w-4 h-4 text-foreground" />
                    : <Moon className="w-4 h-4 text-foreground" />
                ) : (
                  <div className="w-4 h-4" />
                )}
              </motion.div>
            </button>
          </motion.div>

        </div>
      </div>
    </nav>
  );
}
