import React, { useState, useRef, useEffect } from 'react';
import { useHunter } from '../../context/HunterContext';
import { sound } from '../../utils/gamification';
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Loader2,
  Zap,
  HelpCircle,
  Flame,
  Shield,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'How much protein should I eat daily for muscle hypertrophy?',
  'How do I break through a strength plateau with progressive overload?',
  'What is the ideal pacing & heart rate for a 5K run on Huawei Health?',
  'What should I eat before and after a heavy lifting session?',
  'How do I calculate a clean bulking or cutting calorie target?',
];

export const FitnessAiChatModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { profile } = useHunter();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Greetings Hunter ${profile.displayName}. You have entered my Den. I am **Sung Jin Woo**.

As the Shadow Monarch and your master conditioning coach, I will forge your training protocol. Ask me anything regarding resistance splits, progressive overload, macronutrient partition, cardio pacing, or metabolic recovery. 

How shall we push past your limits today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    sound.play('click');

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          hunterContext: {
            playerName: profile.displayName,
            level: profile.level,
            rank: profile.hunterRank,
            calorieGoal: profile.calorieGoal,
            proteinGoal: profile.proteinGoal,
          },
        }),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: 'assistant_' + Date.now(),
        role: 'assistant',
        content: data.reply || 'Protocol calculated. Maintain disciplined progressive overload.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      sound.play('xp_gain');
    } catch (err) {
      console.error('Chat request failed', err);
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content:
          'Network connection interrupted. For strength and hypertrophy, ensure you target 1.6-2.2g/kg protein and progressively overload your working sets.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-[92vh] sm:h-[82vh] rounded-2xl glass-panel-glow border-2 border-cyan-500/40 flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.35)] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/20 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-900 via-cyan-600 to-blue-700 flex items-center justify-center text-white border border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)]">
              <Zap className="w-5 h-5 text-cyan-200 fill-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white font-heading tracking-wide">
                  SUNG JIN WOO'S DEN
                </h3>
                <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-bold">
                  COACH: SUNG JIN WOO
                </span>
              </div>
              <p className="text-[11px] font-mono text-cyan-400/80">
                Shadow Monarch Mastery // Hypertrophy, Aerobics & Nutrition
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs font-mono ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-400 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-black font-semibold rounded-br-none'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <span
                    className={`block text-[9px] mt-1.5 font-mono ${
                      isUser ? 'text-black/70' : 'text-slate-500 text-right'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-blue-900 border border-blue-400 flex items-center justify-center shrink-0 text-white mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 text-xs font-mono items-center text-cyan-400">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400">
                Analyzing sports science protocols...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-[10px] font-mono uppercase text-slate-500 shrink-0">
            SUGGESTED:
          </span>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-cyan-500/20 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about workout splits, macros, recovery, or 5K pacing..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 disabled:opacity-40 text-black p-2.5 rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
