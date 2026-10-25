import React, { useState } from 'react';
import { useStore, calculateLevelFromXp, getRankTitle } from '../store/useStore';
import { X, LogOut, Trophy, Flame, Zap, Coins, Star, Award, User, Calendar, TrendingUp, Edit3, Check } from 'lucide-react';

const RANK_COLORS = {
  'Novice Architect': 'from-slate-500 to-slate-400',
  'Apprentice Builder': 'from-emerald-600 to-teal-400',
  'Vanguard Champion': 'from-blue-600 to-cyan-400',
  'Master Strategist': 'from-purple-600 to-violet-400',
  'Grandmaster Paragon': 'from-amber-500 to-yellow-400',
  'Transcendent Sovereign': 'from-rose-500 via-pink-400 to-amber-400',
};
const AVATAR_EMOJIS = ['🧠','⚡','🔥','🎯','🚀','💎','🦁','🐉','🌟','🗡️','🏹','🔮'];
const BADGE_DEFS = [
  { id: 'first_challenge', icon: '🎯', label: 'First Quest' },
  { id: 'streak_7', icon: '🔥', label: '7-Day Blaze' },
  { id: 'level_5', icon: '⭐', label: 'Level V' },
  { id: 'finance_tracker', icon: '💰', label: 'Money Monk' },
  { id: 'study_master', icon: '📚', label: 'Focus Sage' },
  { id: 'fitness_hero', icon: '💪', label: 'Iron Will' },
];

export const ProfileDrawer = ({ onClose }) => {
  const { user, logoutUser, updateUserLocal, isDark } = useStore();
  const safeUser = user || {};
  const [selectedAvatar, setSelectedAvatar] = useState(safeUser.avatar || '🧠');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(safeUser.name || '');

  const level = calculateLevelFromXp(safeUser.xp || 0);
  const rankTitle = getRankTitle(level);
  const rankGrad = RANK_COLORS[rankTitle] || 'from-indigo-600 to-purple-400';
  const lvlXp = (safeUser.xp || 0) % 500;
  const pct = Math.min(100, (lvlXp / 500) * 100);

  const bg = isDark ? 'bg-[#0b0f1c]' : 'bg-white';
  const border = isDark ? 'border-slate-700/50' : 'border-slate-200';
  const tp = isDark ? 'text-white' : 'text-slate-900';
  const tm = isDark ? 'text-slate-400' : 'text-slate-500';
  const sec = isDark ? 'bg-slate-900/50' : 'bg-slate-50';

  const handleSaveName = () => { if (nameInput.trim()) updateUserLocal({ name: nameInput.trim() }); setEditingName(false); };
  const handleAvatarSelect = (e) => { setSelectedAvatar(e); updateUserLocal({ avatar: e }); };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-start">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-sm h-full ${bg} border-r ${border} flex flex-col overflow-hidden shadow-2xl`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${border} shrink-0`}>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span className={`font-bold text-sm ${tp}`}>Player Profile</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Identity card */}
          <div className={`rounded-2xl ${sec} border ${border} p-5 text-center`}>
            <div className={`relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${rankGrad} shadow-xl mb-3`}>
              <span className="text-4xl">{selectedAvatar}</span>
              <div className="absolute -bottom-1.5 -right-1.5 bg-amber-500 text-slate-950 font-black text-[11px] px-2 py-0.5 rounded-full border-2 border-amber-300 shadow">LVL {level}</div>
            </div>
            {editingName ? (
              <div className="flex items-center gap-1.5 justify-center mt-1">
                <input autoFocus value={nameInput} onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                  className="bg-slate-800 border border-indigo-500 rounded-lg px-2.5 py-1 text-sm text-white font-bold text-center w-36 outline-none" />
                <button onClick={handleSaveName} className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <h3 className={`font-bold text-lg ${tp}`}>{safeUser.name || "Player"}</h3>
                <button onClick={() => { setEditingName(true); setNameInput(user.name); }} className="text-slate-500 hover:text-indigo-400 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
              </div>
            )}
            <p className={`text-xs ${tm} mt-0.5`}>{safeUser.email || ""}</p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mt-2 bg-gradient-to-r ${rankGrad} text-white shadow`}>
              <Trophy className="w-3 h-3" />{rankTitle}
            </span>
          </div>

          {/* XP Bar */}
          <div className={`rounded-2xl ${sec} border ${border} p-4`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={`font-bold ${tp} flex items-center gap-1`}><Zap className="w-3.5 h-3.5 text-emerald-400" /> Level {level}</span>
              <span className={`font-mono ${tm}`}>{lvlXp} / 500 XP</span>
            </div>
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${pct}%` }} />
            </div>
            <p className={`text-[11px] ${tm} mt-1.5 text-right`}>{500 - lvlXp} XP to Level {level + 1}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total XP', value: (safeUser.xp || 0).toLocaleString(), icon: Zap, cls: 'text-emerald-400 bg-emerald-900/30 border-emerald-700/30' },
              { label: 'Coins', value: safeUser.coins || 0, icon: Coins, cls: 'text-amber-400 bg-amber-900/30 border-amber-700/30' },
              { label: 'Streak', value: `${safeUser.streak || 0}🔥`, icon: Flame, cls: 'text-orange-400 bg-orange-900/30 border-orange-700/30' },
            ].map(({ label, value, icon: Icon, cls }) => (
              <div key={label} className={`rounded-xl border p-3 text-center ${cls}`}>
                <Icon className="w-4 h-4 mx-auto mb-1" />
                <p className={`font-bold text-base ${tp}`}>{value}</p>
                <p className={`text-[10px] ${tm}`}>{label}</p>
              </div>
            ))}
          </div>

          {/* Avatar selector */}
          <div className={`rounded-2xl ${sec} border ${border} p-4`}>
            <p className={`text-xs font-bold ${tp} mb-3 uppercase tracking-wide flex items-center gap-1.5`}><Star className="w-3.5 h-3.5 text-amber-400" /> Choose Avatar</p>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_EMOJIS.map(emoji => (
                <button key={emoji} onClick={() => handleAvatarSelect(emoji)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer ${selectedAvatar === emoji ? 'bg-indigo-600 ring-2 ring-indigo-400 scale-110 shadow-lg' : 'bg-slate-800 hover:bg-slate-700'}`}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className={`rounded-2xl ${sec} border ${border} p-4`}>
            <p className={`text-xs font-bold ${tp} mb-3 uppercase tracking-wide flex items-center gap-1.5`}><Award className="w-3.5 h-3.5 text-purple-400" /> Achievement Badges</p>
            <div className="grid grid-cols-3 gap-2">
              {BADGE_DEFS.map(b => {
                const earned = (safeUser.unlockedBadges || []).includes(b.id);
                return (
                  <div key={b.id} className={`rounded-xl p-2.5 text-center border transition-all ${earned ? 'bg-indigo-900/40 border-indigo-600/40' : 'bg-slate-900/40 border-slate-800 opacity-40 grayscale'}`}>
                    <span className="text-2xl">{b.icon}</span>
                    <p className={`text-[10px] font-semibold mt-1 ${earned ? 'text-indigo-300' : tm}`}>{b.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Streak heatmap */}
          <div className={`rounded-2xl ${sec} border ${border} p-4`}>
            <p className={`text-xs font-bold ${tp} mb-3 uppercase tracking-wide flex items-center gap-1.5`}><TrendingUp className="w-3.5 h-3.5 text-orange-400" /> Streak History</p>
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: 14 }, (_, i) => {
                const active = i < (user.streak || 0) % 14;
                return <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${active ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-800 text-slate-600'}`}>{active ? '🔥' : '·'}</div>;
              })}
            </div>
            <p className={`text-[11px] ${tm} mt-2`}>Last 14 days — {user.streak || 0} active days</p>
          </div>

          <div className={`rounded-2xl ${sec} border ${border} p-4`}>
            <div className="flex items-center gap-2 text-xs"><Calendar className="w-4 h-4 text-indigo-400" /><span className={tm}>Member since {new Date().getFullYear()}</span></div>
          </div>
        </div>

        {/* Logout */}
        <div className={`p-5 border-t ${border} shrink-0`}>
          <button onClick={() => { logoutUser(); onClose(); }}
            className="w-full py-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/40 text-rose-400 hover:text-rose-300 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
