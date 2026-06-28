'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, Shield, Lightbulb, TrendingUp, Sparkles } from 'lucide-react';
import type { AIInsight } from '@/lib/types';

interface AIInsightsProps {
  insights: AIInsight;
  riskLevel: string;
}

export const AIInsights = memo(function AIInsights({ insights }: AIInsightsProps) {
  const [showSafety, setShowSafety] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  const confidenceMeta =
    insights.confidence >= 85
      ? { cls: 'text-green-500 bg-green-500/10 border-green-500/20', dot: 'bg-green-500', label: 'High confidence' }
      : insights.confidence >= 70
      ? { cls: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', dot: 'bg-yellow-500', label: 'Moderate confidence' }
      : { cls: 'text-orange-500 bg-orange-500/10 border-orange-500/20', dot: 'bg-orange-500', label: 'Low confidence' };

  return (
    <div className="card-primary shadow-premium h-full flex flex-col">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-border/25">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">AI Weather Intelligence</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">Llama 3.3 70B · Atmospheric reasoning</p>
          </div>
        </div>

        {/* Confidence badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${confidenceMeta.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${confidenceMeta.dot} animate-pulse`} />
          {insights.confidence}%
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-6 py-5 space-y-5 overflow-y-auto scrollbar-hide">

        {/* Summary highlight — most prominent element */}
        <div className="insight-block">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm font-semibold text-foreground leading-relaxed">
              {insights.summary}
            </p>
          </div>
        </div>

        {/* Explanation — secondary text */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insights.explanation}
        </p>

        {/* Recommendations */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-primary/70" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Action Checklist
            </p>
          </div>
          <ul className="space-y-2.5">
            {insights.recommendations.map((rec, i) => {
              const isChecked = checkedItems.has(i);
              return (
                <li key={i} className="flex items-start gap-3 text-sm group cursor-pointer" onClick={() => toggleCheck(i)}>
                  <button className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                    isChecked 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'bg-primary/10 border-primary/20 text-transparent hover:border-primary/50'
                  }`}>
                    {isChecked && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <span className={`leading-relaxed pt-0.5 transition-all ${isChecked ? 'text-muted-foreground/40 line-through' : 'text-muted-foreground group-hover:text-foreground/90'}`}>
                    {rec}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Outlook */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/20 border border-border/20">
          <TrendingUp className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1.5">
              Outlook
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">{insights.outlook}</p>
          </div>
        </div>

        {/* Safety tips — collapsible */}
        <div className="border-t border-border/20 pt-4">
          <button
            onClick={() => setShowSafety(v => !v)}
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/60 hover:text-foreground transition-colors w-full group"
          >
            <Shield className="w-3.5 h-3.5 text-primary/60 group-hover:text-primary transition-colors" />
            Safety Tips
            <span className="ml-auto flex items-center gap-1 text-muted-foreground/70">
              <span className="text-[10px]">{insights.safetyTips.length} tips</span>
              <motion.span
                animate={{ rotate: showSafety ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.span>
            </span>
          </button>

          <AnimatePresence>
            {showSafety && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="mt-3.5 space-y-2.5 overflow-hidden"
              >
                {insights.safetyTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <span className="w-1 h-1 rounded-full bg-accent/50 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});
