'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Mail, Phone, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import type { LocationInfo } from '@/lib/types';

interface AlertSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationInfo;
}

export function AlertSubscriptionModal({ isOpen, onClose, location }: AlertSubscriptionModalProps) {
  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: location.city, method, contact })
      });
      
      if (!res.ok) throw new Error('Subscription failed');
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setContact('');
        onClose();
      }, 3000);
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[1001] p-4"
          >
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Emergency Alerts</h2>
                    <p className="text-xs text-white/50">For {location.city}</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="flex flex-col items-center justify-center py-6 text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">Subscribed Successfully!</p>
                      <p className="text-sm text-white/60 mt-1">You will receive critical atmospheric alerts for {location.city}.</p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Select Delivery Method</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setMethod('email')}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                            method === 'email' 
                              ? 'bg-primary/20 border-primary text-primary' 
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          <Mail className="w-4 h-4" />
                          <span className="text-sm font-semibold">Email</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMethod('sms')}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                            method === 'sms' 
                              ? 'bg-primary/20 border-primary text-primary' 
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          <Phone className="w-4 h-4" />
                          <span className="text-sm font-semibold">SMS (Text)</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Contact Details</label>
                      <input 
                        type={method === 'email' ? 'email' : 'tel'}
                        placeholder={method === 'email' ? 'Enter your email address' : 'Enter your phone number'}
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        required
                        className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>

                    {error && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || !contact}
                      className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary text-primary-foreground font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        'Subscribe to Alerts'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
