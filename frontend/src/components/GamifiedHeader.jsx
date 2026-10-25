import React from 'react';
import { useStore, calculateLevelFromXp } from '../store/useStore';
import { Zap } from 'lucide-react';

export const GamifiedHeader = () => {
  const user  = useStore(s => s.user);
  const isDark = useStore(s => s.isDark);

  const safeUser  = user || {};
  const level     = calculateLevelFromXp(safeUser.xp || 0);
  const xpInLvl   = (safeUser.xp || 0) % 500;
  const progress  = Math.min(100, (xpInLvl / 500) * 100);
  const xpToNext  = 500 - xpInLvl;

  /* Only shown on mobile — desktop uses LeftSidebar for all that info */
  return (
    <header className={`lg:hidden sticky top-0 z-40 w-full border-b ${isDark ? 'border-indigo-900/40 bg-[#0b0f19]/90' : 'border-slate-200 bg-white/90'} backdrop-blur-md px-4 py-3`}>
      <div className="flex items-center gap-4">
        {/* Avatar + level badge */}
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25">
            <div className="w-full h-full bg-[#0d1322] rounded-[10px] flex items-center justify-center">
              <span className="text-base">{user.avatar || '🧠'}</span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1 py-0.5 rounded-full border border-amber-300 leading-none">
            L{level}
          </div>
        </div>

        {/* Name + XP bar */}
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name || 'Player'}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="relative flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] font-mono text-slate-500 shrink-0">
              <span className="text-emerald-400">{xpInLvl}</span>/{500} XP
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-950/40 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold">
            🔥{safeUser.streak || 0}
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <Zap className="w-3 h-3 fill-emerald-400" />{safeUser.xp || 0}
          </div>
        </div>
      </div>
    </header>
  );
};
