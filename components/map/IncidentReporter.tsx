'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check, MapPin, Loader2 } from 'lucide-react';

interface IncidentReporterProps {
  coords: { lat: number; lng: number } | null;
  onCancel: () => void;
  onSuccess: (incident: any) => void;
}

export function IncidentReporter({ coords, onCancel, onSuccess }: IncidentReporterProps) {
  const [type, setType] = useState('flood');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!coords) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: coords.lat,
          longitude: coords.lng,
          type,
          severity,
          description,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to report incident. Have you set up Supabase?');
      }

      const data = await res.json();
      onSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="absolute bottom-4 right-4 z-[500] w-80 bg-[#1a1f2e]/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Report Incident
          </h3>
          <button onClick={onCancel} className="text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-white/60 bg-black/20 p-2 rounded-lg">
            <MapPin className="w-3 h-3 text-primary" />
            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/70 font-medium">Incident Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-primary/50"
            >
              <option value="flood">Flash Flood / Waterlogging</option>
              <option value="tree_down">Fallen Tree / Debris</option>
              <option value="power_outage">Power Outage</option>
              <option value="need_help">Emergency Assistance Needed</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/70 font-medium">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-primary/50"
            >
              <option value="low">Low - Monitor</option>
              <option value="medium">Medium - Caution</option>
              <option value="high">High - Dangerous</option>
              <option value="critical">Critical - Life Threatening</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/70 font-medium">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details..."
              rows={2}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-400 bg-red-400/10 p-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Submit Report
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
