import React from 'react';
import { useStore, calculateLevelFromXp, checkIsStreakActiveToday } from '../store/useStore';
import { Zap, Flame, Trophy } from 'lucide-react';

export const GamifiedHeader = () => {
  const user  = useStore(s => s.user);
  const isDark = useStore(s => s.isDark);

  const safeUser  = user || {};
  const level     = calculateLevelFromXp(safeUser.xp || 0);
  const xpInLvl   = (safeUser.xp || 0) % 500;
  const progress  = Math.min(100, (xpInLvl / 500) * 100);
  const isStreakActive = checkIsStreakActiveToday(safeUser);

  /* Only shown on mobile — desktop uses LeftSidebar */
  return (
    <header className={`lg:hidden sticky top-0 z-40 w-full border-b ${isDark ? 'border-[#1a2f26] bg-[#111e18]/95' : 'border-[#EEF2F0] bg-white/95'} backdrop-blur-md px-4 py-3 shadow-sm`}>
      <div className="flex items-center gap-3">
        {/* Avatar + level badge */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#124F34] to-[#10B981] p-0.5 shadow-md shadow-emerald-950/20">
            <div className={`w-full h-full ${isDark ? 'bg-[#111e18]' : 'bg-[#F4F6F5]'} rounded-[12px] flex items-center justify-center`}>
              <span className="text-base">{safeUser.avatar || '🧠'}</span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#124F34] text-white font-black text-[9px] px-1.5 py-0.5 rounded-full border border-white leading-none">
            L{level}
          </div>
        </div>

        {/* Name + XP bar */}
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-[#111827]'}`}>{safeUser.name || 'Player'}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="relative flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#124F34] to-[#10B981] transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] font-mono text-[#6B7280] shrink-0">
              <span className="text-[#124F34] font-bold">{xpInLvl}</span>/500 XP
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-xs font-mono font-bold transition-all ${
            isStreakActive
              ? "bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C]"
              : isDark
                ? "bg-[#14261f] border-[#1a2f26] text-slate-500"
                : "bg-[#F4F6F5] border-[#E5E7EB] text-[#6B7280]"
          }`}>
            <Flame className={`w-3 h-3 ${isStreakActive ? "fill-[#EA580C]" : "text-[#9CA3AF]"}`} />
            {isStreakActive ? (safeUser.streak || 1) : (safeUser.streak || 0)}
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#E6F4ED] border border-[#C2E7D3] text-[#124F34] text-xs font-mono font-bold">
            <Zap className="w-3 h-3 fill-[#10B981]" />{safeUser.xp || 0}
          </div>
        </div>
      </div>
    </header>
  );
};
