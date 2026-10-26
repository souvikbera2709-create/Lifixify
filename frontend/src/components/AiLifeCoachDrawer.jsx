import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Zap,
  Flame,
  HelpCircle,
  Lightbulb,
  Loader2
} from 'lucide-react';

const PROMPT_SUGGESTIONS = [
  "I'm procrastinating right now, give me a 5-minute micro-quest!",
  "Review my current level & streak, what should I conquer next?",
  "How can I balance heavy strength workouts with deep study focus?",
  "Suggest a 7-day challenge to build a rock-solid morning routine."
];

export const AiLifeCoachDrawer = () => {
  const { isAiDrawerOpen, toggleAiDrawer, user, isDark = false } = useStore();
  const safeIsDark = Boolean(isDark);
  const safeUser = user || { name: 'Player' };

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Greetings, ${safeUser.name || 'Player'}! 🌟 I am Lumina, your AI Life Coach. Whether you are facing procrastination, planning your next multi-day campaign, or leveling up your fitness and focus, I am here to guide your quest. How can we level up today?`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAiDrawerOpen) {
      scrollToBottom();
    }
  }, [messages, isAiDrawerOpen]);

  const handleSendMessage = async (customMessage) => {
    const textToSend = customMessage || inputValue;
    if (!textToSend.trim() || isTyping) return;

    const userMsg = { role: 'user', text: textToSend.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const data = await api.ai.askCoach(textToSend.trim());
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        throw new Error('No reply from coach');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `You've got this, ${safeUser.name || 'Player'}! ⚔️ Focus on the immediate next 5 minutes. Break your largest task down into a tiny micro-step: write just one sentence, open one file, or do 10 pushups. Momentum defeats inertia every single time!`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleAiDrawer}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#124F34] via-[#0D5C3A] to-[#10B981] hover:from-[#0D5C3A] hover:to-[#0B3A26] text-white font-bold text-xs shadow-xl shadow-emerald-950/25 border border-[#C2E7D3]/40 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow group-hover:rotate-12 transition-transform" />
        <span className="font-display font-bold tracking-wide">Ask Life Coach Lumina</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Slide-out Drawer */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-left border-l ${
            safeIsDark ? "bg-[#111e18] border-[#1a2f26]" : "bg-white border-[#EEF2F0]"
          }`}>
            
            {/* Drawer Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              safeIsDark ? "border-[#1a2f26] bg-[#0f1d16]" : "border-[#EEF2F0] bg-[#F9FCFA]"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#124F34] to-[#10B981] flex items-center justify-center text-white shadow-md shadow-emerald-950/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-display font-black text-sm flex items-center gap-1.5 ${
                    safeIsDark ? "text-white" : "text-[#111827]"
                  }`}>
                    Lumina
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6F4ED] text-[#124F34] border border-[#C2E7D3] font-bold">
                      Gemini AI
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#6B7280]">Your Gamified Life Coach & Quest Mentor</p>
                </div>
              </div>

              <button
                onClick={toggleAiDrawer}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  safeIsDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F4F6F5]"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestion Pills */}
            <div className={`p-3 border-b overflow-x-auto scrollbar-none flex items-center gap-1.5 ${
              safeIsDark ? "bg-[#0b1310] border-[#1a2f26]" : "bg-[#F4F6F5] border-[#EEF2F0]"
            }`}>
              {PROMPT_SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(suggestion)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                    safeIsDark
                      ? "bg-[#14261f] border-[#1a2f26] text-emerald-300 hover:text-white"
                      : "bg-white border-[#EEF2F0] text-[#124F34] hover:bg-[#E6F4ED]"
                  }`}
                >
                  {suggestion.slice(0, 32)}...
                </button>
              ))}
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3.5">
              {messages.map((msg, index) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                        isAssistant 
                          ? 'bg-[#E6F4ED] text-[#124F34] border border-[#C2E7D3]' 
                          : 'bg-[#124F34] text-white shadow-sm'
                      }`}
                    >
                      {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isAssistant
                          ? safeIsDark
                            ? 'bg-[#14261f] border border-[#1a2f26] text-slate-200'
                            : 'bg-[#F4F6F5] border border-[#EEF2F0] text-[#111827]'
                          : 'bg-[#124F34] text-white font-medium shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-[#124F34] p-2 italic">
                  <Loader2 className="w-4 h-4 animate-spin text-[#10B981]" />
                  <span>Lumina is formulating your next quest...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className={`p-3.5 border-t flex items-center gap-2 ${
                safeIsDark ? "border-[#1a2f26] bg-[#0f1d16]" : "border-[#EEF2F0] bg-[#F9FCFA]"
              }`}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Lumina anything..."
                className={`flex-1 px-3.5 py-2.5 rounded-2xl border text-xs outline-none transition-all ${
                  safeIsDark
                    ? "bg-[#14261f] border-[#1a2f26] text-white placeholder-slate-500 focus:border-[#10B981]"
                    : "bg-white border-[#EEF2F0] text-[#111827] placeholder-[#9CA3AF] focus:border-[#124F34]"
                }`}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="p-2.5 rounded-2xl bg-[#124F34] hover:bg-[#0D5C3A] disabled:opacity-50 text-white active:scale-95 transition-all cursor-pointer shadow-md shadow-emerald-950/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
};
