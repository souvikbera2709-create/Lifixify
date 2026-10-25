import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { Trophy, Flame, Zap, RefreshCw, Users } from 'lucide-react';

export const CommunityLeaderboard = () => {
  const { user, isDark } = useStore();
  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.getLeaderboard();
      if (data.success && Array.isArray(data.leaderboard)) {
        // Mark current user's row
        const rows = data.leaderboard
          .filter(p => p && p.name && !p.name.match(/^Hero/i) && !p.email?.endsWith("@lifixify.io"))
          .map(p => ({
            ...p,
            isYou: p._id === user._id || p.email === user.email
          }));
        setEntries(rows);
        setLastFetch(new Date().toLocaleTimeString());
      } else {
        setError('Could not fetch leaderboard.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const cardBg  = isDark ? 'bg-[#111e18] border-[#1a2f26]' : 'bg-white border-[#EEF2F0] shadow-[0_4px_20px_rgba(0,0,0,0.03)]';
  const textSub = isDark ? 'text-slate-400' : 'text-[#6B7280]';

  const MEDALS = [
    { label: '1st', grad: 'from-amber-500 to-yellow-300',   border: 'border-amber-400',  text: 'text-amber-400'  },
    { label: '2nd', grad: 'from-slate-400 to-slate-200',    border: 'border-slate-300',  text: 'text-slate-300'  },
    { label: '3rd', grad: 'from-orange-700 to-amber-600',   border: 'border-orange-600', text: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between p-5 rounded-2xl ${cardBg} border`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className={`font-display font-black text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>Community Leaderboard</h2>
            <p className={`text-xs ${textSub}`}>
              {lastFetch ? `Updated at ${lastFetch} · ` : ''}{entries.length} registered players
            </p>
          </div>
        </div>
        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} ${loading ? 'opacity-50' : ''}`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className={`p-12 rounded-2xl ${cardBg} border flex flex-col items-center justify-center gap-3`}>
          <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
          <p className={`text-sm font-medium ${textSub}`}>Fetching live standings…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-700/40 text-center space-y-2">
          <p className="text-rose-400 font-semibold text-sm">{error}</p>
          <button onClick={fetchLeaderboard} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer">Retry</button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && entries.length === 0 && (
        <div className={`p-12 rounded-2xl ${cardBg} border flex flex-col items-center justify-center gap-3 text-center`}>
          <Users className={`w-10 h-10 ${textSub}`} />
          <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>No players yet</p>
          <p className={`text-xs ${textSub}`}>Be the first to register and claim the top spot!</p>
        </div>
      )}

      {/* Podium — top 3 */}
      {!loading && !error && entries.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {entries.slice(0, 3).map((p, idx) => {
              const m = MEDALS[idx] || MEDALS[2];
              return (
                <div key={p._id || idx} className={`p-5 rounded-2xl ${cardBg} border-2 ${m.border} flex flex-col items-center text-center relative overflow-hidden shadow-lg ${p.isYou ? 'ring-2 ring-indigo-400/50' : ''}`}>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${m.grad} p-0.5 mb-2`}>
                    <div className="w-full h-full bg-[#0d1322] rounded-[14px] flex items-center justify-center font-black text-lg text-white">{m.label}</div>
                  </div>
                  <h4 className={`font-display font-bold text-sm truncate max-w-[140px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {p.name}{p.isYou ? ' (You)' : ''}
                  </h4>
                  <p className="text-xs font-semibold text-indigo-400 mt-0.5">Level {p.level}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs font-mono">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold"><Zap className="w-3.5 h-3.5 fill-emerald-400" />{p.xp} XP</span>
                    <span className="flex items-center gap-1 text-orange-400 font-bold"><Flame className="w-3.5 h-3.5 fill-orange-400" />{p.streak}d</span>
                  </div>
                  {p.isYou && <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">YOU</span>}
                </div>
              );
            })}
          </div>

          {/* Full Table */}
          <div className={`rounded-2xl ${cardBg} border overflow-hidden`}>
            <table className="w-full text-left text-xs">
              <thead className={`${isDark ? 'bg-slate-900/80' : 'bg-slate-100'} text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Streak</th>
                  <th className="py-3 px-4 text-right">XP</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'} font-medium`}>
                {entries.map((p, idx) => (
                  <tr
                    key={p._id || idx}
                    className={p.isYou
                      ? isDark ? 'bg-indigo-950/30 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                      : isDark ? 'text-slate-300 hover:bg-slate-900/40' : 'text-slate-600 hover:bg-slate-50'}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">#{idx + 1}</td>
                    <td className="py-3 px-4 font-bold flex items-center gap-2">
                      <span className={isDark ? 'text-white' : 'text-slate-900'}>{p.name}</span>
                      {p.isYou && <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">YOU</span>}
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-400">Lv {p.level}</td>
                    <td className="py-3 px-4 text-orange-400 font-bold">
                      <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 fill-orange-400" />{p.streak}d</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">{p.xp} XP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
