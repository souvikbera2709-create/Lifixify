import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import {
  Trophy,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  ChevronRight,
  Flame,
  Award,
  Zap
} from 'lucide-react';

export const ChallengeEngine = () => {
  const { addXp, addCoins, isDark, recordQualifyingActivity } = useStore();
  const [challenges, setChallenges] = useState(() => {
    try {
      const saved = localStorage.getItem('lifixify_challenges');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [selectedChallenge, setSelectedChallenge] = useState(() => {
    try {
      const saved = localStorage.getItem('lifixify_challenges');
      const list = saved ? JSON.parse(saved) : [];
      return list.length > 0 ? list[0] : null;
    } catch { return null; }
  });
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [totalDays, setTotalDays] = useState(7);
  const [category, setCategory] = useState('productivity');
  const [description, setDescription] = useState('');

  // Advance planning task state
  const [plannedTaskName, setPlannedTaskName] = useState('');
  const [plannedTaskXp, setPlannedTaskXp] = useState(25);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const data = await api.challenges.getAll();
      if (data.success && data.challenges) {
        setChallenges(data.challenges);
        if (data.challenges.length > 0 && !selectedChallenge) {
          setSelectedChallenge(data.challenges[0]);
        }
      }
    } catch (e) {
      console.log('Using local fallback challenges');
      // Starter fallback challenge if backend not yet seeded
      if (challenges.length === 0) {
        const fallback = {
          _id: 'default-challenge-1',
          title: '30-Day Peak Discipline',
          description: 'Build unbreakable focus, daily workouts, and deep work',
          totalDays: 30,
          category: 'productivity',
          status: 'active',
          daysData: Array.from({ length: 30 }, (_, i) => ({
            dayNumber: i + 1,
            completedStatus: i === 0,
            tasks: [
              { _id: `t-${i}-1`, taskName: `Day ${i + 1} Deep Work Sprint (45m)`, completed: i === 0, xpReward: 25 },
              { _id: `t-${i}-2`, taskName: `Day ${i + 1} Habit Check-in & Water Goal`, completed: i === 0, xpReward: 15 }
            ]
          }))
        };
        setChallenges([fallback]);
        setSelectedChallenge(fallback);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  // Persist challenges locally on change
  useEffect(() => {
    try {
      if (challenges && challenges.length > 0) {
        localStorage.setItem('lifixify_challenges', JSON.stringify(challenges));
      }
    } catch {}
  }, [challenges]);

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await api.challenges.create({
        title: title.trim(),
        totalDays: Number(totalDays),
        category,
        description: description.trim()
      });
      if (res.success && res.challenge) {
        setChallenges([res.challenge, ...challenges]);
        setSelectedChallenge(res.challenge);
        setSelectedDayNumber(1);
      }
    } catch (err) {
      // Local fallback
      const localChallenge = {
        _id: `ch-${Date.now()}`,
        title: title.trim(),
        totalDays: Number(totalDays),
        category,
        description: description.trim(),
        status: 'active',
        daysData: Array.from({ length: Number(totalDays) }, (_, i) => ({
          dayNumber: i + 1,
          completedStatus: false,
          tasks: [
            { _id: `task-${Date.now()}-1`, taskName: `Day ${i + 1} Primary Quest`, completed: false, xpReward: 25 },
            { _id: `task-${Date.now()}-2`, taskName: `Day ${i + 1} Reflection`, completed: false, xpReward: 15 }
          ]
        }))
      };
      setChallenges([localChallenge, ...challenges]);
      setSelectedChallenge(localChallenge);
      setSelectedDayNumber(1);
    }

    setTitle('');
    setDescription('');
    setIsCreating(false);
  };

  // Toggle task completion
  const handleToggleTask = async (taskId, currentCompleted) => {
    if (!selectedChallenge) return;
    const targetStatus = !currentCompleted;

    // Optimistic UI update
    const updatedDaysData = selectedChallenge.daysData.map((d) => {
      if (d.dayNumber === selectedDayNumber) {
        const updatedTasks = d.tasks.map((t) => (t._id === taskId ? { ...t, completed: targetStatus } : t));
        const allCompleted = updatedTasks.every((t) => t.completed);
        return { ...d, tasks: updatedTasks, completedStatus: allCompleted };
      }
      return d;
    });

    const updatedChallenge = {
      ...selectedChallenge,
      daysData: updatedDaysData,
      status: updatedDaysData.every((d) => d.completedStatus) ? 'completed' : selectedChallenge.status
    };

    setSelectedChallenge(updatedChallenge);
    setChallenges(challenges.map((c) => (c._id === selectedChallenge._id ? updatedChallenge : c)));

    if (targetStatus) {
      addXp(25);
      addCoins(5);
      try { recordQualifyingActivity(); } catch {}
    }

    try {
      await api.challenges.toggleTask(selectedChallenge._id, selectedDayNumber, taskId, targetStatus);
    } catch (e) {
      // state updated optimistically
    }
  };

  // Advance Planning: Plan a task for any day in advance
  const handlePlanTask = async (e) => {
    e.preventDefault();
    if (!plannedTaskName.trim() || !selectedChallenge) return;

    const newTask = {
      _id: `planned-${Date.now()}`,
      taskName: plannedTaskName.trim(),
      completed: false,
      xpReward: Number(plannedTaskXp) || 25
    };

    const updatedDays = selectedChallenge.daysData.map((d) => {
      if (d.dayNumber === selectedDayNumber) {
        return {
          ...d,
          tasks: [...d.tasks, newTask],
          completedStatus: false
        };
      }
      return d;
    });

    const updatedChallenge = { ...selectedChallenge, daysData: updatedDays };
    setSelectedChallenge(updatedChallenge);
    setChallenges(challenges.map((c) => (c._id === selectedChallenge._id ? updatedChallenge : c)));

    try {
      await api.challenges.planTask(selectedChallenge._id, selectedDayNumber, plannedTaskName.trim(), plannedTaskXp);
    } catch (e) {
      // optimistic update maintained
    }

    setPlannedTaskName('');
  };

  // Claim grand completion reward
  const handleClaimMilestone = async () => {
    if (!selectedChallenge) return;
    addXp(250);
    addCoins(100);
    try {
      await api.challenges.claimMilestone(selectedChallenge._id);
    } catch (e) {}
    alert('🎉 Grand Challenge Milestone Claimed! +250 XP and +100 Coins awarded!');
  };


  // Delete an entire challenge/campaign
  const handleDeleteChallenge = async (challengeId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) return;

    const updated = challenges.filter((c) => c._id !== challengeId);
    setChallenges(updated);
    if (selectedChallenge?._id === challengeId) {
      setSelectedChallenge(updated.length > 0 ? updated[0] : null);
      setSelectedDayNumber(1);
    }
    try {
      await api.challenges.delete(challengeId);
    } catch (e) {
      // Optimistic update maintained for local-only challenges
    }
  };

  // Remove an individual quest from a specific day
  const handleRemoveQuest = async (taskId, e) => {
    e.stopPropagation();
    if (!selectedChallenge) return;

    const updatedDays = selectedChallenge.daysData.map((d) => {
      if (d.dayNumber === selectedDayNumber) {
        const updatedTasks = d.tasks.filter((t) => t._id !== taskId);
        const allCompleted = updatedTasks.length > 0 && updatedTasks.every((t) => t.completed);
        return { ...d, tasks: updatedTasks, completedStatus: allCompleted };
      }
      return d;
    });

    const updatedChallenge = { ...selectedChallenge, daysData: updatedDays };
    setSelectedChallenge(updatedChallenge);
    setChallenges(challenges.map((c) => (c._id === selectedChallenge._id ? updatedChallenge : c)));

    try {
      await api.challenges.removeTask(selectedChallenge._id, selectedDayNumber, taskId);
    } catch (e) {
      // Optimistic update maintained
    }
  };

  // Active day calculations
  const activeDay = selectedChallenge?.daysData?.find((d) => d.dayNumber === selectedDayNumber);
  const totalCompletedDays = selectedChallenge?.daysData?.filter((d) => d.completedStatus).length || 0;
  const progressPercent = selectedChallenge
    ? Math.round((totalCompletedDays / selectedChallenge.totalDays) * 100)
    : 0;

  return (
    <div className={`rounded-3xl p-6 border transition-all ${isDark ? "bg-[#111e18] border-[#1a2f26]" : "bg-white border-[#EEF2F0] shadow-[0_4px_20px_rgba(0,0,0,0.03)]"}`}>

      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#EEF2F0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#124F34] to-[#10B981] flex items-center justify-center text-white shadow-md shadow-emerald-950/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`font-display font-black text-xl flex items-center gap-2 ${isDark ? "text-white" : "text-[#111827]"}`}>
              Multi-Day Challenge Engine
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F4ED] text-[#124F34] border border-[#C2E7D3]">
                Advance Planning
              </span>
            </h2>
            <p className="text-xs text-[#6B7280]">
              Create arbitrary-length campaigns (7, 30, 75 days) and plan daily quests in advance
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#124F34] hover:bg-[#0D5C3A] text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Close Form' : 'New Challenge'}</span>
        </button>
      </div>

      {/* Challenge Creator Form */}
      {isCreating && (
        <form onSubmit={handleCreateChallenge} className="my-5 p-5 rounded-2xl bg-[#090d16] border border-purple-900/40 space-y-4 animate-fade-in">
          <h3 className="font-display font-bold text-sm text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Configure Your New Campaign
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Challenge Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 75-Day Hardcore Fitness & Coding Protocol"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Days</label>
              <select
                value={totalDays}
                onChange={(e) => setTotalDays(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white outline-none"
              >
                <option value={7}>7 Days (Sprint)</option>
                <option value={14}>14 Days (Habit Builder)</option>
                <option value={21}>21 Days (Neuroplasticity)</option>
                <option value={30}>30 Days (Discipline Reset)</option>
                <option value={75}>75 Days (Hardcore Transformation)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category & Focus</label>
            <div className="flex items-center gap-2 flex-wrap">
              {['productivity', 'fitness', 'learning', 'mindfulness', 'finance'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    category === cat
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 active:scale-95"
            >
              Launch Challenge
            </button>
          </div>
        </form>
      )}

      {/* Main Campaign Selector & Progress Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Left Column: Challenges List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Your Campaigns</span>
            <span>{challenges.length} Active</span>
          </h4>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {(challenges || []).map((c) => {
              const isSelected = selectedChallenge?._id === c._id;
              const completedDays = c.daysData?.filter((d) => d.completedStatus).length || 0;
              const percent = Math.round((completedDays / c.totalDays) * 100);

              return (
                <div
                  key={c._id}
                  onClick={() => {
                    setSelectedChallenge(c);
                    setSelectedDayNumber(1);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display font-bold text-sm text-white truncate max-w-[140px]">
                      {c.title}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-purple-300">
                        {c.totalDays}D
                      </span>
                      <button
                        onClick={(e) => handleDeleteChallenge(c._id, e)}
                        title="Delete campaign"
                        className="p-1 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Day {completedDays} of {c.totalDays}</span>
                      <span className="font-mono font-bold text-purple-300">{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Nested Day-by-Day Task Viewer & Advance Planner */}
        {selectedChallenge && (
          <div className="lg:col-span-2 bg-[#090d16] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              
              {/* Campaign Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    {selectedChallenge.title}
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Category: <span className="text-purple-400 capitalize">{selectedChallenge.category}</span> &bull; {selectedChallenge.totalDays} Total Days
                  </p>
                </div>

                {progressPercent === 100 && (
                  <button
                    onClick={handleClaimMilestone}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-md animate-pulse cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>Claim +250 XP & 100 Coins</span>
                  </button>
                )}
              </div>

              {/* Day Selector Pill Navigation */}
              <div className="my-4">
                <span className="text-xs font-semibold text-slate-400 mb-2 block">
                  Select Day to View or Plan Tasks in Advance:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                  {(selectedChallenge?.daysData || []).map((d) => {
                    const isSelected = selectedDayNumber === d.dayNumber;
                    return (
                      <button
                        key={d.dayNumber}
                        onClick={() => setSelectedDayNumber(d.dayNumber)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                            : d.completedStatus
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        Day {d.dayNumber} {d.completedStatus && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Day Tasks List */}
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Day {selectedDayNumber} Quests:</span>
                  <span className="text-emerald-400">+25 XP Per Completed Task</span>
                </div>

                {activeDay?.tasks?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 italic">No tasks planned yet for Day {selectedDayNumber}. Add one below!</p>
                ) : (
                  (activeDay?.tasks || []).map((task) => (
                    <div
                      key={task._id}
                      onClick={() => handleToggleTask(task._id, task.completed)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        task.completed
                          ? 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
                          : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:border-purple-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className="text-xs font-medium truncate">{task.taskName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          +{task.xpReward || 25} XP
                        </span>
                        <button
                          onClick={(e) => handleRemoveQuest(task._id, e)}
                          title="Remove quest"
                          className="p-1 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

            {/* Advance Task Planning Form */}
            <form onSubmit={handlePlanTask} className="mt-5 pt-3 border-t border-slate-800/80 flex items-center gap-2">
              <input
                type="text"
                value={plannedTaskName}
                onChange={(e) => setPlannedTaskName(e.target.value)}
                placeholder={`Plan a quest in advance for Day ${selectedDayNumber}...`}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-[#124F34] hover:bg-[#0D5C3A] text-white text-xs font-bold whitespace-nowrap active:scale-95 transition-all shadow"
              >
                + Plan Quest
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
