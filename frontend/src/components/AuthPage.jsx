import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { Eye, EyeOff, Sparkles, Zap, Trophy, Flame, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const AuthPage = () => {
  const { loginUser } = useStore();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (mode === 'signup') {
        if (!name.trim()) { setError('Name is required.'); setLoading(false); return; }
        data = await api.auth.register(name.trim(), email.trim(), password);
      } else {
        data = await api.auth.login(email.trim(), password);
      }
      if (data.token && data.user) {
        loginUser(data.user, data.token);
      } else {
        setError(data.message || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      // Network failure (backend unreachable / no internet)
      const isNetworkError = (
        err instanceof TypeError ||
        err.message === 'Failed to fetch' ||
        err.message === 'Load failed' ||
        err.message === 'NetworkError when attempting to fetch resource.' ||
        err.message?.toLowerCase().includes('network') ||
        err.message?.toLowerCase().includes('failed to fetch')
      );
      if (isNetworkError) {
        const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        if (isProd) {
          setError(
            'Unable to connect to the server. The backend may be starting up — please try again in 30 seconds.'
          );
        } else {
          setError('Unable to connect to server. Please ensure the backend is running on port 5001.');
        }
      } else {
        // Server responded with an error — use the server message
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F5] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-800/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#124F34] to-[#10B981] shadow-xl shadow-emerald-950/20 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-black text-3xl text-[#111827] tracking-tight">LiFixify</h1>
          <p className="text-[#6B7280] text-sm mt-1 font-medium">Gamified Life Productivity OS</p>
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            {[
              { icon: Zap, label: 'XP System', cls: 'text-[#124F34] bg-[#E6F4ED] border-[#C2E7D3]' },
              { icon: Trophy, label: 'Leaderboard', cls: 'text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]' },
              { icon: Flame, label: 'Streaks', cls: 'text-[#C2410C] bg-[#FFF7ED] border-[#FED7AA]' },
            ].map(({ icon: Icon, label, cls }) => (
              <span key={label} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
                <Icon className="w-3 h-3" />{label}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#EEF2F0] rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex rounded-2xl bg-[#F4F6F5] border border-[#EEF2F0] p-1 mb-6">
            {['login', 'signup'].map(tab => (
              <button key={tab} onClick={() => { setMode(tab); setError(''); }}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all capitalize cursor-pointer ${
                  mode === tab ? 'bg-[#124F34] text-white shadow-md shadow-emerald-950/20' : 'text-[#6B7280] hover:text-[#111827]'
                }`}>
                {tab === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-[#111827] mb-1.5 uppercase tracking-wide">Your Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex Storm" required
                  className="w-full px-4 py-3 rounded-xl bg-[#F4F6F5] border border-[#EEF2F0] text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#124F34] transition-all" />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5 uppercase tracking-wide">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                className="w-full px-4 py-3 rounded-xl bg-[#F4F6F5] border border-[#EEF2F0] text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#124F34] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters" required minLength={6}
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-[#F4F6F5] border border-[#EEF2F0] text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#124F34] transition-all" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-[#124F34] hover:bg-[#0D5C3A] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-950/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <>{mode === 'login' ? 'Sign In & Enter Dashboard' : 'Create Account & Start'}<ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <p className="text-center text-xs text-slate-500 mt-5">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer">
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
        <p className="text-center text-[11px] text-slate-600 mt-6">Secured with JWT · Data stored in MongoDB Atlas</p>
      </div>
    </div>
  );
};
