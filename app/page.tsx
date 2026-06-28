'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Brain, Zap, Map, Cloud, ShieldAlert, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { EmergencyTicker } from '@/components/home/EmergencyTicker';
import { LiveGlobe } from '@/components/home/LiveGlobe';
import { AiDemo } from '@/components/home/AiDemo';

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const features = [
  {
    id: 'ai',
    Icon: Brain,
    title: 'AI-Powered',
    description: 'Llama 3.3 70B atmospheric reasoning and predictive intelligence',
  },
  {
    id: 'realtime',
    Icon: Zap,
    title: 'Real-Time',
    description: 'Tomorrow.io live data streams with 5-minute refresh cycles',
  },
  {
    id: 'mapping',
    Icon: Map,
    title: 'Risk Mapping',
    description: 'Precision flood zone detection and dynamic risk overlays',
  },
  {
    id: 'weather',
    Icon: Cloud,
    title: 'Full Spectrum',
    description: 'Temperature, pressure, wind, visibility, and more',
  },
];

const useCases = [
  {
    title: "For Citizens",
    description: "Receive instant notifications for sudden risk spikes and get safe, AI-guided evacuation routes.",
    Icon: Users
  },
  {
    title: "For Responders",
    description: "Monitor crowdsourced incident reports like flooded roads or downed power lines in real-time.",
    Icon: ShieldAlert
  },
  {
    title: "For City Planners",
    description: "Analyze historical trend data and predictive climate radar up to 12 hours into the future.",
    Icon: Map
  }
]

export default function LandingPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/dashboard?location=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      <EmergencyTicker />
      
      {/* Live Globe Background */}
      <LiveGlobe />

      <Navbar
        onLocationSearch={(loc) => router.push(`/dashboard?location=${encodeURIComponent(loc)}`)}
        isDemoMode={true}
      />

      <main className="relative z-10 flex-1 w-full">
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center px-4 py-20 min-h-[70vh]">
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="max-w-4xl text-center space-y-8"
          >
            <motion.div variants={item} className="flex justify-center">
              <div className="pill text-primary border-primary/20 bg-primary/8 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Live Global Atmospheric Intelligence
              </div>
            </motion.div>

            <motion.div variants={item} className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] tracking-tight">
                Find Your <span className="gradient-text">Risk.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground/80 max-w-xl mx-auto leading-relaxed">
                Real-time flood monitoring, crowdsourced incident mapping, and AI-powered weather insights.
              </p>
            </motion.div>

            {/* Quick Search Hero */}
            <motion.form 
              variants={item} 
              onSubmit={handleSearch}
              className="relative max-w-xl mx-auto mt-8 flex items-center group"
            >
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex w-full items-center bg-card/80 backdrop-blur-xl border border-border/50 rounded-full p-2 shadow-premium">
                <Search className="w-5 h-5 text-muted-foreground ml-3" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Enter your city to check risk..."
                  className="flex-1 bg-transparent border-none outline-none text-foreground px-4 py-2 placeholder:text-muted-foreground/60"
                />
                <Button type="submit" className="rounded-full px-6">Analyze</Button>
              </div>
            </motion.form>
          </motion.div>
        </section>

        {/* AI Demo & Features Section */}
        <section className="relative px-4 py-20 bg-muted/10 border-t border-border/10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Meet <span className="text-primary">ClimaChat</span>
              </h2>
              <p className="text-muted-foreground/80 leading-relaxed text-lg">
                Your personal AI meteorologist. Ask questions about local conditions, safe driving routes, or storm preparation, and get instant, context-aware answers powered by real-time data streams and Llama 3.3.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                {features.map(({ id, Icon, title, description }) => (
                  <div key={id} className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
                    <Icon className="w-5 h-5 text-primary mb-2" />
                    <h3 className="text-sm font-semibold mb-1">{title}</h3>
                    <p className="text-xs text-muted-foreground/70">{description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <AiDemo />
            </motion.div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="relative px-4 py-24">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Built for Every Scenario</h2>
              <p className="text-muted-foreground/80 max-w-2xl mx-auto">From daily commutes to city-wide emergency management.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {useCases.map((uc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-card/60 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <uc.Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{uc.title}</h3>
                  <p className="text-sm text-muted-foreground/70 leading-relaxed">{uc.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/20 px-4 py-8 bg-background">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground/40">
            Powered by Tomorrow.io · Llama 3.3 70B · Real-time atmospheric modeling
          </p>
          <p className="text-xs text-muted-foreground/50 font-medium tracking-wide">
            Made for <span className="text-primary/70">WeatherWise Hack</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
