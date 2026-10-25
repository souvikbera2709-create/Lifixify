import React, { useState } from 'react';
import { useStore, calculateLevelFromXp, getRankTitle } from '../store/useStore';
import { ChallengeEngine } from './ChallengeEngine';
import { FitnessNutritionHub } from './FitnessNutritionHub';
import { FinanceHub } from './FinanceHub';
import { StudyBuddyHub } from './StudyBuddyHub';
import {
  Sparkles, Trash2, Plus, Check, Zap, Coins, X, Flame, Trophy,
  ArrowUpRight, ShoppingBag, ShieldCheck
} from 'lucide-react';

// Custom Module Card with equalized styling
const CustomModuleCard = ({ cm }) => {
  const { removeCustomModule, addTaskToModule, toggleModuleTask, isDark } = useStore();
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');

  const tasks = cm.tasks || [];
  const completedCount = tasks.filter(t => t.completed).length;

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    addTaskToModule(cm.id, newTaskName.trim());
    setNewTaskName('');
    setAddingTask(false);
  };

  const cardBg = isDark ? 'bg-[#111e18] border-[#1a2f26]' : 'bg-white border-[#EEF2F0] shadow-[0_4px_20px_rgba(0,0,0,0.03)]';

  return (
    <div className={`rounded-3xl p-6 border flex flex-col justify-between gap-4 transition-all hover:border-[#C2E7D3] ${cardBg}`}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#EEF2F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4ED] border border-[#C2E7D3] flex items-center justify-center text-[#124F34]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-display font-black text-base truncate max-w-[160px] ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                {cm.title}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F4ED] text-[#124F34]">
                {cm.category}
              </span>
            </div>
          </div>
          <button
            onClick={() => removeCustomModule(cm.id)}
            className="text-[#6B7280] hover:text-rose-500 p-1.5 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
            title="Delete module"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        {tasks.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
              <span className="text-[#6B7280]">{completedCount}/{tasks.length} tasks done</span>
              <span className="text-[#124F34] font-mono font-bold">{Math.round((completedCount / tasks.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#124F34] to-[#10B981] transition-all duration-500"
                style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Tasks list */}
        <div className="space-y-2 mt-3 max-h-48 overflow-y-auto pr-0.5">
          {tasks.map(task => (
            <div
              key={task.id}
              onClick={() => toggleModuleTask(cm.id, task.id)}
              className={`flex items-center gap-2.5 p-2.5 rounded-2xl cursor-pointer transition-all select-none border ${
                task.completed
                  ? 'bg-[#E6F4ED] border-[#C2E7D3] text-[#124F34]'
                  : isDark
                    ? 'bg-[#14261f] border-[#1a2f26] text-slate-200'
                    : 'bg-[#F9FCFA] border-[#EEF2F0] hover:border-[#C2E7D3] text-[#111827]'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                task.completed ? 'bg-[#124F34] border-[#124F34]' : 'border-[#D1D5DB] bg-white'
              }`}>
                {task.completed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              </div>
              <span className={`text-xs flex-1 font-medium ${task.completed ? 'line-through opacity-70' : ''}`}>
                {task.name}
              </span>
              {task.completed && (
                <span className="text-[10px] text-[#124F34] font-mono font-bold flex items-center gap-0.5">
                  <Zap className="w-3 h-3 fill-[#10B981]" />+25
                </span>
              )}
            </div>
          ))}

          {tasks.length === 0 && (
            <p className="text-xs text-[#6B7280] text-center py-4 italic">
              No tasks added yet. Add one below!
            </p>
          )}
        </div>
      </div>

      {/* Add Task Form / Button */}
      <div className="pt-2">
        {addingTask ? (
          <form onSubmit={handleAddTask} className="flex items-center gap-2">
            <input
              autoFocus
              value={newTaskName}
              onChange={e => setNewTaskName(e.target.value)}
              placeholder="New task name..."
              className="flex-1 px-3 py-2 rounded-2xl bg-[#F4F6F5] border border-[#124F34] text-xs text-[#111827] outline-none"
            />
            <button
              type="submit"
              className="p-2 rounded-2xl bg-[#124F34] hover:bg-[#0D5C3A] text-white cursor-pointer shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setAddingTask(false)}
              className="p-2 rounded-2xl bg-[#F4F6F5] text-[#6B7280] hover:text-[#111827] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setAddingTask(true)}
            className="w-full py-2.5 rounded-2xl border border-dashed border-[#C2E7D3] hover:border-[#124F34] bg-[#E6F4ED]/50 hover:bg-[#E6F4ED] text-[#124F34] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task (+25 XP · +5 C)
          </button>
        )}
      </div>
    </div>
  );
};

export const DashboardGrid = () => {
  const { user, isDark, activeModuleFilter = "All Modules", customModules = [], setActiveSidePanel } = useStore();

  const safeUser = user || {};
  const level = calculateLevelFromXp(safeUser.xp || 0);
  const rankTitle = getRankTitle(level);
  const xpInLvl = (safeUser.xp || 0) % 500;
  const progress = Math.min(100, (xpInLvl / 500) * 100);

  const shouldShow = (categoryOrName) => {
    if (!activeModuleFilter || activeModuleFilter === "All Modules") return true;
    return activeModuleFilter.toLowerCase() === (categoryOrName || "").toLowerCase();
  };

  const safeCustomModules = Array.isArray(customModules) ? customModules : [];
  const visibleCustomModules = safeCustomModules.filter(cm =>
    !cm ? false : (
      activeModuleFilter === "All Modules" ||
      activeModuleFilter.toLowerCase() === (cm.title || "").toLowerCase() ||
      activeModuleFilter.toLowerCase() === (cm.category || "").toLowerCase()
    )
  );

  const statCardBg = isDark
    ? "bg-[#111e18] border-[#1a2f26]"
    : "bg-white border-[#EEF2F0] shadow-[0_4px_20px_rgba(0,0,0,0.03)]";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">

      {/* ── 1. Top-Row Equal-Width Stat Metric Cards ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1: Level & Rank */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition-all hover:border-[#C2E7D3] ${statCardBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Player Rank</span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#124F34] to-[#10B981] flex items-center justify-center text-white shadow-md shadow-emerald-950/20">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className={`font-display font-black text-2xl ${isDark ? 'text-white' : 'text-[#111827]'}`}>
              Level {level}
            </h3>
            <p className="text-xs font-semibold text-[#124F34] truncate mt-0.5">
              {rankTitle}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-[#EEF2F0]">
            <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-[#6B7280]">
              <span>Progress to L{level + 1}</span>
              <span className="font-bold text-[#124F34]">{xpInLvl}/500 XP</span>
            </div>
            <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#124F34] to-[#10B981] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 2: Discipline XP */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition-all hover:border-[#C2E7D3] ${statCardBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Total Score</span>
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4ED] border border-[#C2E7D3] flex items-center justify-center text-[#124F34]">
              <Zap className="w-5 h-5 fill-[#10B981] text-[#10B981]" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className={`font-display font-black text-2xl ${isDark ? 'text-white' : 'text-[#111827]'}`}>
              {safeUser.xp || 0} <span className="text-sm font-bold text-[#6B7280]">XP</span>
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Accumulated Score
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-[#EEF2F0] flex items-center justify-between">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6F4ED] text-[#124F34] font-bold border border-[#C2E7D3] flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-[#10B981]" /> +25 XP / task
            </span>
            <span className="text-[10px] font-mono text-[#6B7280]">Active</span>
          </div>
        </div>

        {/* Metric 3: Active Streak */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition-all hover:border-[#C2E7D3] ${statCardBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Discipline Streak</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C]">
              <Flame className="w-5 h-5 fill-[#EA580C] animate-pulse" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className={`font-display font-black text-2xl ${isDark ? 'text-white' : 'text-[#111827]'}`}>
              {safeUser.streak || 0} <span className="text-sm font-bold text-[#6B7280]">Days</span>
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Unbroken Daily Rhythm
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-[#EEF2F0] flex items-center justify-between">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#C2410C] font-bold border border-[#FED7AA] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#EA580C]" /> Streak Active
            </span>
            <span className="text-[10px] font-mono text-[#6B7280]">x1.2 Multiplier</span>
          </div>
        </div>

        {/* Metric 4: Coins Vault */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition-all hover:border-[#C2E7D3] ${statCardBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Reward Vault</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className={`font-display font-black text-2xl ${isDark ? 'text-white' : 'text-[#111827]'}`}>
              {safeUser.coins || 0} <span className="text-sm font-bold text-[#6B7280]">Coins</span>
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Available Balance
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-[#EEF2F0] flex items-center justify-between">
            <button
              onClick={() => setActiveSidePanel('rewards')}
              className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] font-bold border border-[#FDE68A] flex items-center gap-1 hover:bg-[#FDE68A] transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3 h-3" /> Rewards Shop
            </button>
            <span className="text-[10px] font-mono text-[#6B7280]">Spend</span>
          </div>
        </div>

      </section>

      {/* ── 2. Unified Feature Modules ── */}
      <div className="space-y-8">
        
        {/* Study & Focus Hub */}
        {shouldShow('Study & Focus') && (
          <section id="study-buddy" className="w-full">
            <StudyBuddyHub />
          </section>
        )}

        {/* Fitness & Nutrition Hub */}
        {shouldShow('Fitness & Nutrition') && (
          <section id="fitness-nutrition" className="w-full">
            <FitnessNutritionHub />
          </section>
        )}

        {/* Finance Tracking Hub */}
        {shouldShow('Finance Tracking') && (
          <section id="finance-tracking" className="w-full">
            <FinanceHub />
          </section>
        )}

        {/* Custom Multi-Day Challenge Engine */}
        {(shouldShow('Daily Life') || shouldShow('Challenges')) && (
          <section id="challenges-engine" className="w-full">
            <ChallengeEngine />
          </section>
        )}

        {/* Custom User Workspace Modules Grid (responsive 1 to 3 columns) */}
        {visibleCustomModules.length > 0 && (
          <section id="custom-modules" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-6 rounded-full bg-[#124F34]" />
                <h2 className={`font-display font-black text-xl ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                  Custom Workspace Modules
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E6F4ED] text-[#124F34] border border-[#C2E7D3] text-xs font-bold">
                  {visibleCustomModules.length} Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCustomModules.map(cm => (
                <CustomModuleCard key={cm.id} cm={cm} />
              ))}
            </div>
          </section>
        )}

      </div>

    </div>
  );
};
