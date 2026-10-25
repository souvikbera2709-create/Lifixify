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
  const { isAiDrawerOpen, toggleAiDrawer, user } = useStore();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Greetings, ${user.name}! 🌟 I am Lumina, your AI Life Coach. Whether you are facing procrastination, planning your next multi-day campaign, or leveling up your fitness and focus, I am here to guide your quest. How can we level up today?`
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
          text: `You've got this, ${user.name}! ⚔️ Focus on the immediate next 5 minutes. Break your largest task down into a tiny micro-step: write just one sentence, open one file, or do 10 pushups. Momentum defeats inertia every single time!`
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
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-2xl shadow-purple-600/50 border border-purple-400/40 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow group-hover:rotate-12 transition-transform" />
        <span className="font-display font-bold tracking-wide">Ask Life Coach Lumina</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Slide-out Drawer */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md h-full bg-[#0d1322] border-l border-purple-500/30 flex flex-col shadow-2xl animate-slide-left">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0a0f1c]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    Lumina
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                      Gemini 3.5 Flash
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Your Gamified Life Coach & Quest Mentor</p>
                </div>
              </div>

              <button
                onClick={toggleAiDrawer}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestion Pills */}
            <div className="p-3 bg-[#080c14] border-b border-slate-800/80 overflow-x-auto scrollbar-none flex items-center gap-1.5">
              {PROMPT_SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(suggestion)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-purple-300/90 hover:text-white hover:border-purple-500/50 whitespace-nowrap transition-colors"
                >
                  {suggestion.slice(0, 32)}...
                </button>
              ))}
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg, index) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                        isAssistant ? 'bg-purple-600/30 text-purple-300' : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isAssistant
                          ? 'bg-[#12192c] border border-slate-800 text-slate-200'
                          : 'bg-indigo-600 text-white font-medium'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-purple-300 p-2 italic">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
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
              className="p-3.5 border-t border-slate-800 bg-[#0a0f1c] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Lumina anything..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white active:scale-95 transition-all cursor-pointer shadow"
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
