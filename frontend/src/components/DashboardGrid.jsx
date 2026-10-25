import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ChallengeEngine } from './ChallengeEngine';
import { FitnessNutritionHub } from './FitnessNutritionHub';
import { FinanceHub } from './FinanceHub';
import { StudyBuddyHub } from './StudyBuddyHub';
import { Sparkles, Trash2, Plus, Check, Zap, Coins, X, CheckCircle2 } from 'lucide-react';

// Custom Module Card with inline task planning
const CustomModuleCard = ({ cm }) => {
  const { removeCustomModule, addTaskToModule, toggleModuleTask } = useStore();
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

  return (
    <div
      className="bg-[#0d1322]/90 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 hover:border-slate-700 transition-all border-t-2"
      style={{ borderTopColor: cm.accentColor || '#8b5cf6' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border"
            style={{ backgroundColor: `${cm.accentColor}20`, borderColor: `${cm.accentColor}40`, color: cm.accentColor }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm truncate max-w-[150px]">{cm.title}</h3>
            <p className="text-[10px] text-slate-500">{cm.category}</p>
          </div>
        </div>
        <button onClick={() => removeCustomModule(cm.id)} className="text-slate-600 hover:text-rose-400 p-1 transition-colors cursor-pointer">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress */}
      {tasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-400 font-medium">{completedCount}/{tasks.length} tasks done</span>
            <span className="text-emerald-400 font-mono">{Math.round((completedCount / tasks.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Tasks list */}
      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {(tasks || []).map(task => (
          <div
            key={task.id}
            onClick={() => toggleModuleTask(cm.id, task.id)}
            className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all select-none ${
              task.completed
                ? 'bg-emerald-900/20 border border-emerald-700/30'
                : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
              task.completed ? 'bg-emerald-500 border-emerald-400' : 'border-slate-600'
            }`}>
              {task.completed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </div>
            <span className={`text-xs flex-1 ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
              {task.name}
            </span>
            {task.completed && (
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                <Zap className="w-3 h-3" />+25
              </span>
            )}
          </div>
        ))}

        {tasks.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-2">No tasks yet. Add one below to earn XP!</p>
        )}
      </div>

      {/* Add Task */}
      {addingTask ? (
        <form onSubmit={handleAddTask} className="flex items-center gap-1.5">
          <input
            autoFocus
            value={newTaskName}
            onChange={e => setNewTaskName(e.target.value)}
            placeholder="Task name..."
            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-indigo-500 text-xs text-white outline-none placeholder-slate-500"
          />
          <button type="submit" className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-colors">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => setAddingTask(false)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAddingTask(true)}
          className="w-full py-2 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/50 text-slate-500 hover:text-indigo-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Task (+25 XP · +5 Coins)
        </button>
      )}
    </div>
  );
};

export const DashboardGrid = () => {
  const { activeModuleFilter = "All Modules", customModules = [] } = useStore();

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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">

      {/* 1. Custom Multi-Day Challenge Engine */}
      {(shouldShow('Daily Life') || shouldShow('Challenges')) && (
        <section id="challenges-engine"><ChallengeEngine /></section>
      )}

      {/* 2. Study & Focus Hub */}
      {shouldShow('Study & Focus') && (
        <section id="study-buddy"><StudyBuddyHub /></section>
      )}

      {/* 3. Fitness & Nutrition Hub */}
      {shouldShow('Fitness & Nutrition') && (
        <section id="fitness-nutrition"><FitnessNutritionHub /></section>
      )}

      {/* 4. Finance Tracking Hub */}
      {shouldShow('Finance Tracking') && (
        <section id="finance-tracking"><FinanceHub /></section>
      )}


      {/* 6. Custom User Modules — with full task planning */}
      {visibleCustomModules.length > 0 && (
        <section id="custom-modules">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-pink-500 to-purple-600" />
            <h2 className="font-bold text-white text-lg">Custom Workspace Modules</h2>
            <span className="px-2 py-0.5 rounded-full bg-pink-900/30 text-pink-400 border border-pink-700/30 text-[11px] font-semibold">{visibleCustomModules.length} active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleCustomModules.map(cm => <CustomModuleCard key={cm.id} cm={cm} />)}
          </div>
        </section>
      )}

    </main>
  );
};
