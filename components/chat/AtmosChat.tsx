'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';
import type { DashboardData } from '@/lib/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const QUICK_ACTIONS = [
  "Is it safe to travel?",
  "Will rainfall worsen tonight?",
  "Is outdoor activity safe?",
  "Will visibility decline later?",
  "Any flood risk nearby?"
];

export function AtmosChat({ data }: { data?: DashboardData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'assistant',
    content: "Hello. I'm AtmosChat, your realtime atmospheric intelligence assistant. How can I help you understand today's conditions?"
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const messageText = overrideInput || input;
    if (!messageText.trim() || isLoading) return;

    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: messageText.trim() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, context: data }),
      });

      if (!res.ok) throw new Error('Network response was not ok');
      if (!res.body) throw new Error('No body in response');

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            if (line.replace(/^data: /, '') === '[DONE]') {
              done = true;
              break;
            }
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                const text = parsed.choices[0]?.delta?.content || '';
                if (text) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMsgId ? { ...msg, content: msg.content + text } : msg
                  ));
                  scrollToBottom();
                }
              } catch (err) {
                // Ignore parse errors from incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId ? { ...msg, content: 'I am currently unable to reach the atmospheric intelligence network. Please try again later.' } : msg
      ));
    } finally {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
      ));
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-4 w-[380px] h-[550px] max-h-[80vh] flex flex-col overflow-hidden rounded-2xl border border-white/10 glass-sm shadow-premium-lg"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">AtmosChat</h3>
                  <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live Intelligence
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-sm' 
                      : 'bg-muted/40 border border-white/5 text-foreground/90 rounded-bl-sm'
                  }`}>
                    {msg.content}
                    {msg.isStreaming && <span className="inline-block w-1.5 h-3 ml-1 align-middle bg-primary/70 animate-pulse" />}
                  </div>
                </div>
              ))}
              
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {QUICK_ACTIONS.map(action => (
                    <button
                      key={action}
                      onClick={() => handleSubmit(undefined, action)}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary/90 hover:bg-primary/20 hover:text-primary transition-all text-left"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <form 
                onSubmit={handleSubmit}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about atmospheric conditions..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/40 disabled:opacity-50 disabled:hover:bg-primary/20 transition-colors"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-premium flex items-center justify-center glow-primary border border-primary/20"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
