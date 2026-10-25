import React, { useState } from "react";
import { useStore, calculateLevelFromXp, getRankTitle, checkIsStreakActiveToday } from "../store/useStore";
import {
  User, Trophy, ShoppingBag, Flame, Zap, Coins,
  Volume2, VolumeX, Sun, Moon, Sparkles, ChevronRight, LayoutDashboard, LogOut
} from "lucide-react";
import { ProfileDrawer } from "./ProfileDrawer";

const MENU_ITEMS = [
  { id: "dashboard",   label: "Dashboard",     icon: LayoutDashboard },
  { id: "profile",     label: "Profile",       icon: User },
  { id: "rewards",     label: "Rewards Shop",  icon: ShoppingBag },
  { id: "leaderboard", label: "Leaderboard",   icon: Trophy },
];

export const LeftSidebar = () => {
  const { user, isMuted, toggleSound, isDark, toggleTheme, activeSidePanel, setActiveSidePanel, setActiveModuleFilter, logoutUser } = useStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const safeUser  = user || {};
  const level     = calculateLevelFromXp(safeUser.xp || 0);
  const rankTitle = getRankTitle(level);
  const xpInLvl   = (safeUser.xp || 0) % 500;
  const progress  = Math.min(100, (xpInLvl / 500) * 100);
  const isStreakActive = checkIsStreakActiveToday(safeUser);

  const sideBg  = isDark ? "bg-[#111e18] border-[#1a2f26]" : "bg-white border-[#EEF2F0]";
  const textPrimary = isDark ? "text-slate-100" : "text-[#111827]";
  const textMuted   = isDark ? "text-slate-400" : "text-[#6B7280]";
  const divider = isDark ? "border-[#1a2f26]" : "border-[#EEF2F0]";

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
      <aside className={`hidden lg:flex flex-col w-64 shrink-0 border-r ${sideBg} sticky top-0 h-screen overflow-y-auto z-30 py-6 px-4 gap-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]`}>

        {/* App Logo */}
        <button
          onClick={() => { setActiveSidePanel(null); setActiveModuleFilter("All Modules"); }}
          className="flex items-center gap-3 px-1.5 text-left cursor-pointer group w-full"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#124F34] to-[#10B981] flex items-center justify-center shadow-md shadow-emerald-900/20 shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className={`font-display font-black text-lg tracking-tight leading-none ${textPrimary}`}>LiFixify</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E6F4ED] text-[#124F34] border border-[#C2E7D3]">OS</span>
            </div>
            <span className="text-[10px] font-semibold tracking-wide text-[#6B7280]">Life Operating System</span>
          </div>
        </button>

        {/* User Profile Card */}
        <button
          onClick={() => setProfileOpen(true)}
          className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer text-left w-full shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${
            isDark 
              ? "border-[#1a2f26] hover:border-[#10B981]/40 bg-[#14261f]" 
              : "border-[#EEF2F0] hover:border-[#C2E7D3] bg-[#FFFFFF] hover:bg-[#F9FCFA]"
          }`}
        >
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#124F34] to-[#10B981] p-0.5 shadow-md shadow-emerald-900/15">
              <div className={`w-full h-full ${isDark ? "bg-[#111e18]" : "bg-[#F4F6F5]"} rounded-[13px] flex items-center justify-center`}>
                <span className="text-xl">{safeUser.avatar || "🧠"}</span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#124F34] text-white font-black text-[9px] px-1.5 py-0.5 rounded-full border border-white leading-none shadow-sm">
              L{level}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm truncate transition-colors ${isDark ? "text-white group-hover:text-emerald-300" : "text-[#111827] group-hover:text-[#124F34]"}`}>
              {safeUser.name || "Player"}
            </p>
            <p className="text-[11px] font-semibold text-[#124F34] flex items-center gap-1 truncate">
              <Trophy className="w-2.5 h-2.5 shrink-0 text-[#10B981]" />
              {rankTitle}
            </p>
          </div>
          <ChevronRight className={`w-4 h-4 ${textMuted} group-hover:text-[#124F34] transition-colors shrink-0`} />
        </button>

        {/* XP Progress Bar */}
        <div className={`p-3 rounded-2xl border ${isDark ? "bg-[#14261f] border-[#1a2f26]" : "bg-[#F9FCFA] border-[#EEF2F0]"}`}>
          <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium">
            <span className="text-[#124F34] font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 fill-[#10B981] text-[#10B981]" />Level {level}
            </span>
            <span className={`font-mono text-[10px] ${textMuted}`}>
              <strong className="text-[#124F34]">{xpInLvl}</strong> / 500 XP
            </span>
          </div>
          <div className="relative h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#124F34] via-[#0D5C3A] to-[#10B981] transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stat Chips */}
        <div className="grid grid-cols-3 gap-2 px-0.5">
          <div className={`flex flex-col items-center py-2.5 rounded-2xl border transition-all ${
            isStreakActive
              ? "bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C]"
              : isDark
                ? "bg-[#14261f] border-[#1a2f26] text-slate-500"
                : "bg-[#F4F6F5] border-[#E5E7EB] text-[#6B7280]"
          }`}>
            <Flame className={`w-3.5 h-3.5 ${isStreakActive ? "fill-[#EA580C] text-[#EA580C] animate-pulse" : "text-[#9CA3AF]"}`} />
            <span className="font-mono font-black text-sm mt-0.5">{isStreakActive ? (safeUser.streak || 1) : (safeUser.streak || 0)}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">{isStreakActive ? "Streak" : "Unlit"}</span>
          </div>
          <div className="flex flex-col items-center py-2.5 rounded-2xl border bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]">
            <Coins className="w-3.5 h-3.5 text-[#D97706]" />
            <span className="font-mono font-black text-sm mt-0.5">{safeUser.coins || 0}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">Coins</span>
          </div>
          <div className="flex flex-col items-center py-2.5 rounded-2xl border bg-[#E6F4ED] border-[#C2E7D3] text-[#124F34]">
            <Zap className="w-3.5 h-3.5 fill-[#10B981] text-[#10B981]" />
            <span className="font-mono font-black text-sm mt-0.5">{safeUser.xp || 0}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">XP</span>
          </div>
        </div>

        <div className={`border-t ${divider}`} />

        {/* Section: MENU */}
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-1 text-[#6B7280]">
            MENU
          </p>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === "dashboard"
              ? activeSidePanel === null
              : activeSidePanel === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all cursor-pointer w-full text-left font-semibold text-sm ${
                  isActive
                    ? "bg-[#124F34] text-white shadow-md shadow-emerald-950/20"
                    : isDark
                      ? "text-slate-300 hover:bg-[#1a2f26] hover:text-white"
                      : "text-[#6B7280] hover:bg-[#E6F4ED] hover:text-[#124F34]"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : isDark
                        ? "bg-[#1a2f26] text-slate-300 group-hover:text-white"
                        : "bg-[#F4F6F5] text-[#6B7280] group-hover:bg-white group-hover:text-[#124F34]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                )}
              </button>
            );
          })}
        </div>

        {/* Section: GENERAL */}
        <div className="flex flex-col gap-1 pt-2">
          <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-1 text-[#6B7280]">
            GENERAL
          </p>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              isDark
                ? "text-amber-300 hover:bg-[#1a2f26]"
                : "text-[#6B7280] hover:bg-[#E6F4ED] hover:text-[#124F34]"
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${isDark ? "bg-[#1a2f26]" : "bg-[#F4F6F5]"}`}>
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#124F34]" />}
            </div>
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <button
            onClick={toggleSound}
            className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              isMuted
                ? "text-rose-500 hover:bg-rose-50"
                : isDark
                  ? "text-slate-300 hover:bg-[#1a2f26]"
                  : "text-[#6B7280] hover:bg-[#E6F4ED] hover:text-[#124F34]"
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${isDark ? "bg-[#1a2f26]" : "bg-[#F4F6F5]"}`}>
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-[#124F34]" />}
            </div>
            <span>{isMuted ? "Sound: Muted" : "Sound: Active"}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to sign out?")) {
                logoutUser();
              }
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer mt-1"
          >
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-rose-100/60">
              <LogOut className="w-4 h-4 text-rose-600" />
            </div>
            <span>Sign Out</span>
          </button>
        </div>

        <div className="flex-1" />

        {/* LiFixify Version Stamp */}
        <div className={`p-3 rounded-2xl border text-center ${isDark ? "bg-[#14261f] border-[#1a2f26]" : "bg-[#F9FCFA] border-[#EEF2F0]"}`}>
          <p className="text-[11px] font-bold text-[#124F34]">LiFixify Life OS</p>
          <p className="text-[10px] text-[#6B7280]">v2.4 Light Emerald</p>
        </div>

      </aside>
      {profileOpen && <ProfileDrawer onClose={() => setProfileOpen(false)} />}
    </>
  );
};
