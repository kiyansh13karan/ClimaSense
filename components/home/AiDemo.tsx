'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, User, ChevronRight } from 'lucide-react';

const QA_PAIRS = [
  {
    q: "Is it safe to drive in downtown Miami?",
    a: "Based on real-time data, there is a HIGH flood risk (72%) in downtown Miami. Several roads including Biscayne Blvd are currently reported as waterlogged. It is highly recommended to delay non-essential travel.",
  },
  {
    q: "What's the air quality like right now?",
    a: "The AQI is currently 45 (Good) with low PM2.5 levels. UV Index is high (8). It's a great time to be outside, but don't forget your sunscreen!",
  },
  {
    q: "Should I prepare for the upcoming storm?",
    a: "Yes. Forecasts show a 85% probability of severe thunderstorms developing within the next 4 hours. Wind gusts may exceed 40mph. Secure loose outdoor objects and ensure your devices are charged.",
  },
];

export function AiDemo() {
  const [activeQA, setActiveQA] = useState(QA_PAIRS[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedAnswer, setDisplayedAnswer] = useState("");

  const handleSelect = (qa: typeof QA_PAIRS[0]) => {
    setActiveQA(qa);
    setDisplayedAnswer("");
    setIsTyping(true);
    
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedAnswer(qa.a.slice(0, i));
      i += 2;
      if (i > qa.a.length) {
        clearInterval(interval);
        setIsTyping(false);
        setDisplayedAnswer(qa.a);
      }
    }, 20);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-premium-lg">
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">ClimaChat AI</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Live Demo</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Chat History */}
        <div className="space-y-4 min-h-[160px]">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-2 text-sm text-foreground">
              {activeQA.q}
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Brain className="w-3 h-3 text-primary" />
            </div>
            <div className="bg-primary/10 border border-primary/10 rounded-2xl rounded-tl-sm px-4 py-2 text-sm text-foreground/90">
              {displayedAnswer || (isTyping ? "..." : activeQA.a)}
            </div>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="space-y-2 pt-4 border-t border-border/20">
          <p className="text-xs text-muted-foreground font-medium px-1">Try asking:</p>
          {QA_PAIRS.map((qa, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(qa)}
              className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-xs text-foreground/80 hover:text-foreground border border-transparent hover:border-border/50"
            >
              <span className="truncate pr-4">{qa.q}</span>
              <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
