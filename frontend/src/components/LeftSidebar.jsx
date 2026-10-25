import React, { useState } from "react";
import { useStore, calculateLevelFromXp, getRankTitle } from "../store/useStore";
import {
  User, Trophy, ShoppingBag, Flame, Zap, Coins,
  Volume2, VolumeX, Sun, Moon, Sparkles, ChevronRight, LayoutDashboard
} from "lucide-react";
import { ProfileDrawer } from "./ProfileDrawer";

const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",     icon: LayoutDashboard, accent: "indigo" },
  { id: "profile",     label: "Profile",       icon: User,            accent: "purple" },
  { id: "rewards",     label: "Rewards Shop",  icon: ShoppingBag,     accent: "amber"  },
  { id: "leaderboard", label: "Leaderboard",   icon: Trophy,          accent: "emerald"},
];

const ACCENT = {
  indigo:  { text: "text-indigo-400",  bg: "bg-indigo-500/10",  border: "border-indigo-500/30",  active: "bg-indigo-600" },
  purple:  { text: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/30",  active: "bg-purple-600" },
  amber:   { text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   active: "bg-amber-600"  },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", active: "bg-emerald-600" },
};

export const LeftSidebar = () => {
  const { user, isMuted, toggleSound, isDark, toggleTheme, activeSidePanel, setActiveSidePanel, setActiveModuleFilter } = useStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const safeUser  = user || {};
  const level     = calculateLevelFromXp(safeUser.xp || 0);
  const rankTitle = getRankTitle(level);
  const xpInLvl   = (safeUser.xp || 0) % 500;
  const progress  = Math.min(100, (xpInLvl / 500) * 100);

  const sideBg  = isDark ? "bg-[#090d16] border-slate-800/70" : "bg-white border-slate-200";
  const muted   = isDark ? "text-slate-400" : "text-slate-500";
  const divider = isDark ? "border-slate-800" : "border-slate-200";

  const handleNavClick = (itemId) => {
    if (itemId === "dashboard") {
      setActiveSidePanel(null);
      setActiveModuleFilter("All Modules");
    } else if (itemId === "profile") {
      setProfileOpen(true);
    } else if (itemId === "rewards") {
      setActiveSidePanel("rewards");
    } else if (itemId === "leaderboard") {
      setActiveSidePanel("leaderboard");
    }
  };

  return (
    <>
      <aside className={`hidden lg:flex flex-col w-60 shrink-0 border-r ${sideBg} sticky top-0 h-screen overflow-y-auto z-30 py-6 px-4 gap-5`}>

        {/* App Logo */}
        <button
          onClick={() => { setActiveSidePanel(null); setActiveModuleFilter("All Modules"); }}
          className="flex items-center gap-2.5 px-1 text-left cursor-pointer group w-full"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className={`font-display font-black text-lg tracking-tight leading-none ${isDark ? "text-white" : "text-slate-900"}`}>LiFixify</h1>
            <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400">RPG OS</span>
          </div>
        </button>

        {/* User Profile Card */}
        <button
          onClick={() => setProfileOpen(true)}
          className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer text-left w-full ${isDark ? "border-slate-800 hover:border-indigo-500/40 bg-[#0d1322]/80" : "border-slate-200 hover:border-indigo-300 bg-slate-50"}`}
        >
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full bg-[#0d1322] rounded-[12px] flex items-center justify-center">
                <span className="text-xl">{safeUser.avatar || "🧠"}</span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full border border-amber-300 leading-none">L{level}</div>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm truncate transition-colors ${isDark ? "text-white group-hover:text-indigo-300" : "text-slate-900 group-hover:text-indigo-600"}`}>{safeUser.name || "Player"}</p>
            <p className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1 truncate"><Trophy className="w-2.5 h-2.5 shrink-0" />{rankTitle}</p>
          </div>
          <ChevronRight className={`w-4 h-4 ${muted} group-hover:text-indigo-400 transition-colors shrink-0`} />
        </button>

        {/* XP Progress */}
        <div className="px-1">
          <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium">
            <span className="text-emerald-400 font-semibold flex items-center gap-1"><Zap className="w-3 h-3 fill-emerald-400" />Lv {level}</span>
            <span className={`font-mono ${muted}`}><strong className="text-emerald-300">{xpInLvl}</strong> / 500 XP</span>
          </div>
          <div className="relative h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/60">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Stat Chips */}
        <div className="grid grid-cols-3 gap-2 px-1">
          {[
            { icon: Flame,  val: safeUser.streak || 0, label: "Streak", cls: "bg-orange-950/40 border-orange-500/30 text-orange-400", fill: "fill-orange-500 animate-pulse" },
            { icon: Coins,  val: safeUser.coins || 0,  label: "Coins",  cls: "bg-amber-950/40  border-amber-500/30  text-amber-400"  },
            { icon: Zap,    val: safeUser.xp || 0,     label: "XP",     cls: "bg-emerald-950/40 border-emerald-500/30 text-emerald-400", fill: "fill-emerald-500" },
          ].map(({ icon: Icon, val, label, cls, fill }) => (
            <div key={label} className={`flex flex-col items-center py-2.5 rounded-xl border ${cls}`}>
              <Icon className={`w-3.5 h-3.5 ${fill || ""}`} />
              <span className="font-mono font-bold text-sm mt-0.5">{val}</span>
              <span className="text-[9px] opacity-70">{label}</span>
            </div>
          ))}
        </div>

        <div className={`border-t ${divider}`} />

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          <p className={`text-[10px] font-bold uppercase tracking-widest px-2 mb-1 ${muted}`}>Navigation</p>
          {(NAV_ITEMS || []).map(item => {
            const Icon = item.icon;
            const a = ACCENT[item.accent];
            const isActive = item.id === "dashboard"
              ? activeSidePanel === null
              : activeSidePanel === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer w-full text-left ${
                  isActive ? `${a.active} text-white shadow-md` : `${isDark ? "hover:bg-slate-800/60" : "hover:bg-slate-100"} ${a.text}`
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? "bg-white/20" : a.bg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`font-semibold text-sm ${isActive ? "text-white" : isDark ? "text-slate-300" : "text-slate-700"}`}>{item.label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
              </button>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* Controls */}
        <div className={`flex items-center gap-2 px-1 pt-3 border-t ${divider}`}>
          <button onClick={toggleTheme} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isDark ? "bg-slate-800 hover:bg-slate-700 text-amber-400" : "bg-slate-100 hover:bg-slate-200 text-indigo-500"}`} title={isDark ? "Light Mode" : "Dark Mode"}>
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {isDark ? "Light" : "Dark"}
          </button>
          <button onClick={toggleSound} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-slate-200"} ${isMuted ? "text-rose-400" : muted}`} title={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isMuted ? "Muted" : "Sound"}
          </button>
        </div>

      </aside>
      {profileOpen && <ProfileDrawer onClose={() => setProfileOpen(false)} />}
    </>
  );
};
