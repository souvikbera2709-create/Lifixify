import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import {
  Activity, Dumbbell, Droplet, Flame,
  Plus, Trash2, CheckCircle2, TrendingUp,
  Settings, X, Zap, Coins, Gift, Pencil, Loader2
} from 'lucide-react';

const PRESET_EXERCISES = [
  "Incline Dumbbell Press",
  "Barbell Bench Press",
  "Barbell Back Squat",
  "Deadlift",
  "Weighted Pull-ups",
  "Overhead Press",
  "Barbell Row"
];
const CUSTOM_OPTION = "Other / Custom Exercise...";

const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

// Keys for localStorage persistence
const KEY_TARGETS = 'lifixify_fitness_targets';
const KEY_CONSUMED = 'lifixify_fitness_consumed_';
const KEY_WATER    = 'lifixify_water_';
const KEY_WORKOUTS = 'lifixify_workouts_';
const KEY_CUSTOM_EXERCISES = 'lifixify_custom_exercises';

function loadWorkouts() {
  try { return JSON.parse(localStorage.getItem(KEY_WORKOUTS + today())) || []; } catch { return []; }
}
function saveWorkouts(w) {
  try { localStorage.setItem(KEY_WORKOUTS + today(), JSON.stringify(w)); } catch {}
}

function loadCustomExercises() {
  try { return JSON.parse(localStorage.getItem(KEY_CUSTOM_EXERCISES)) || []; } catch { return []; }
}
function saveCustomExercises(exs) {
  try { localStorage.setItem(KEY_CUSTOM_EXERCISES, JSON.stringify(exs)); } catch {}
}

const DEFAULT_TARGETS = { calories: 0, protein: 0, carbs: 0, fats: 0, waterMl: 0 };
const DEFAULT_CONSUMED = { calories: 0, protein: 0, carbs: 0, fats: 0 };

function loadTargets() {
  try { return JSON.parse(localStorage.getItem(KEY_TARGETS)) || DEFAULT_TARGETS; } catch { return DEFAULT_TARGETS; }
}
function saveTargets(t) { localStorage.setItem(KEY_TARGETS, JSON.stringify(t)); }

function loadConsumed() {
  try { return JSON.parse(localStorage.getItem(KEY_CONSUMED + today())) || DEFAULT_CONSUMED; } catch { return DEFAULT_CONSUMED; }
}
function saveConsumed(c) { localStorage.setItem(KEY_CONSUMED + today(), JSON.stringify(c)); }

function loadWater() {
  try { return Number(localStorage.getItem(KEY_WATER + today())) || 0; } catch { return 0; }
}
function saveWater(ml) { localStorage.setItem(KEY_WATER + today(), String(ml)); }

// Track which goals were already rewarded today
const KEY_REWARDED = 'lifixify_fitness_rewarded_';
function loadRewarded() {
  try { return JSON.parse(localStorage.getItem(KEY_REWARDED + today())) || {}; } catch { return {}; }
}
function saveRewarded(r) { localStorage.setItem(KEY_REWARDED + today(), JSON.stringify(r)); }

export const FitnessNutritionHub = () => {
  const { addXp, addCoins, isDark } = useStore();
  const [activeTab, setActiveTab] = useState('workouts');

  // ── Workout state ──────────────────────────────────────────────
  const [workouts,           setWorkouts]           = useState(loadWorkouts);
  const [selectedExercise,   setSelectedExercise]   = useState(PRESET_EXERCISES[0]);
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [setsInput,          setSetsInput]          = useState(3);
  const [repsInput,          setRepsInput]          = useState(10);
  const [weightInput,        setWeightInput]        = useState(60);

  // ── Persistent targets ─────────────────────────────────────────
  const [targets, setTargets] = useState(loadTargets);

  // ── Daily consumed (resets each new day) ──────────────────────
  const [consumed, setConsumed] = useState(loadConsumed);

  // ── Water (ml, daily reset) ────────────────────────────────────
  const [waterMl, setWaterMl] = useState(loadWater);

  // ── Goal rewarded flags ────────────────────────────────────────
  const [rewarded, setRewarded] = useState(loadRewarded);

  // ── Meal form ─────────────────────────────────────────────────
  const [mealCal, setMealCal]   = useState('');
  const [mealPro, setMealPro]   = useState('');
  const [mealCarb, setMealCarb] = useState('');
  const [mealFat, setMealFat]   = useState('');

  // ── Targets edit modal ────────────────────────────────────────
  const [editTargets, setEditTargets] = useState(false);
  const [draftTargets, setDraftTargets] = useState(targets);

  // ── Custom Exercise Manager ───────────────────────────────────
  const [customExercises,    setCustomExercises]    = useState(loadCustomExercises);
  const [showManageEx,       setShowManageEx]       = useState(false);
  const [newExName,          setNewExName]          = useState('');
  const [newExCategory,      setNewExCategory]      = useState('Strength');
  const [exLoading,          setExLoading]          = useState(false);
  const [exSaving,           setExSaving]           = useState(false);

  const fetchCustomExercises = useCallback(async () => {
    setExLoading(true);
    try {
      const data = await api.fitness.getCustomExercises();
      if (data.success) setCustomExercises(data.exercises || []);
    } catch (err) {
      console.error('Failed to fetch custom exercises:', err);
    } finally {
      setExLoading(false);
    }
  }, []);

  const handleAddCustomExercise = async (e) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    setExSaving(true);
    try {
      const data = await api.fitness.addCustomExercise(newExName.trim(), newExCategory);
      if (data.success) {
        setCustomExercises(prev => {
          const exists = prev.some(ex => ex._id === data.exercise._id);
          return exists ? prev : [...prev, data.exercise].sort((a, b) => a.name.localeCompare(b.name));
        });
        setNewExName('');
      }
    } catch (err) {
      console.error('Failed to add custom exercise:', err);
    } finally {
      setExSaving(false);
    }
  };

  const handleDeleteCustomExercise = async (id) => {
    try {
      await api.fitness.deleteCustomExercise(id);
      setCustomExercises(prev => prev.filter(ex => ex._id !== id));
    } catch (err) {
      console.error('Failed to delete custom exercise:', err);
    }
  };

  // Combined dropdown options: presets + custom exercises
  const allExerciseOptions = [
    ...PRESET_EXERCISES,
    ...customExercises.map(ex => ex.name),
  ];

  // Sync from backend once
  useEffect(() => {
    api.fitness.getToday().then(data => {
      if (data.success && data.log) {
        if (data.log.workouts?.length) setWorkouts(data.log.workouts);
      }
    }).catch(() => {});
    fetchCustomExercises();
  }, [fetchCustomExercises]);

  // Persist consumed, water, workouts, and custom exercises on change
  useEffect(() => { saveConsumed(consumed); }, [consumed]);
  useEffect(() => { saveWater(waterMl); }, [waterMl]);
  useEffect(() => { saveWorkouts(workouts); }, [workouts]);
  useEffect(() => { saveCustomExercises(customExercises); }, [customExercises]);

  // ── Check & award goal completion ─────────────────────────────
  const tryAwardGoal = useCallback((key, met) => {
    if (!met || rewarded[key]) return;
    addXp(50);
    addCoins(15);
    const next = { ...rewarded, [key]: true };
    setRewarded(next);
    saveRewarded(next);
  }, [rewarded, addXp, addCoins]);

  // Derived percentages
  const pct = (val, target) => target > 0 ? Math.min(100, Math.round((val / target) * 100)) : 0;
  const calPct  = pct(consumed.calories, targets.calories);
  const proPct  = pct(consumed.protein,  targets.protein);
  const carbPct = pct(consumed.carbs,    targets.carbs);
  const fatPct  = pct(consumed.fats,     targets.fats);
  const watPct  = pct(waterMl, targets.waterMl);

  // Trigger rewards on goal completion
  useEffect(() => { tryAwardGoal('calories', targets.calories > 0 && consumed.calories >= targets.calories); }, [consumed.calories, targets.calories]);
  useEffect(() => { tryAwardGoal('water', targets.waterMl > 0 && waterMl >= targets.waterMl); }, [waterMl, targets.waterMl]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleAddWorkout = async (e) => {
    e.preventDefault();
    const finalExerciseName = selectedExercise === CUSTOM_OPTION
      ? customExerciseName.trim()
      : selectedExercise.trim();

    if (!finalExerciseName) {
      alert("Please enter or select an exercise name");
      return;
    }

    const entry = {
      exercise: finalExerciseName,
      sets: Math.max(1, +setsInput || 1),
      reps: Math.max(0, +repsInput || 10),
      weight: Math.max(0, +weightInput || 0)
    };

    const updated = [...workouts, entry];
    setWorkouts(updated);

    if (selectedExercise === CUSTOM_OPTION) {
      setCustomExerciseName("");
    }

    try {
      await api.fitness.logWorkout({ workouts: updated });
    } catch (err) {
      console.error("Failed to log workout to backend:", err);
    }
  };

  const handleRemoveWorkout = async (idx) => {
    const updated = workouts.filter((_, i) => i !== idx);
    setWorkouts(updated);
    try {
      await api.fitness.logWorkout({ workouts: updated });
    } catch (err) {
      console.error("Failed to update workouts after delete:", err);
    }
  };

  const handleAddMeal = (e) => {
    e.preventDefault();
    const cal = +mealCal || 0, pro = +mealPro || 0, carb = +mealCarb || 0, fat = +mealFat || 0;
    if (!cal && !pro && !carb && !fat) return;
    setConsumed(prev => ({
      calories: prev.calories + cal,
      protein:  prev.protein  + pro,
      carbs:    prev.carbs    + carb,
      fats:     prev.fats     + fat,
    }));
    setMealCal(''); setMealPro(''); setMealCarb(''); setMealFat('');
  };

  const handleDrinkWater = (ml = 250) => setWaterMl(w => w + ml);

  const handleSaveTargets = (e) => {
    e.preventDefault();
    const t = {
      calories: +draftTargets.calories || 0,
      protein:  +draftTargets.protein  || 0,
      carbs:    +draftTargets.carbs    || 0,
      fats:     +draftTargets.fats     || 0,
      waterMl:  +draftTargets.waterMl  || 0,
    };
    setTargets(t);
    saveTargets(t);
    setEditTargets(false);
  };

  // ── Styles ────────────────────────────────────────────────────
  const cardBg  = isDark ? 'bg-[#111e18] border-[#1a2f26]' : 'bg-white border-[#EEF2F0] shadow-[0_4px_20px_rgba(0,0,0,0.03)]';
  const textSub = isDark ? 'text-slate-400' : 'text-[#6B7280]';
  const inputCls = isDark ? 'bg-[#14261f] border-[#1a2f26] text-white placeholder-slate-500' : 'bg-[#F4F6F5] border-[#EEF2F0] text-[#111827] focus:border-[#124F34]';
  const tabBase  = 'px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer';
  const tabActive = 'bg-[#124F34] text-white shadow-md shadow-emerald-950/20';
  const tabIdle   = isDark ? 'text-slate-400 hover:bg-[#1a2f26]' : 'text-[#6B7280] hover:bg-[#E6F4ED] hover:text-[#124F34]';

  const NeedConfig = () => (
    <div className={`p-6 rounded-2xl ${cardBg} border border-dashed border-slate-600 text-center space-y-3`}>
      <Settings className={`w-8 h-8 mx-auto ${textSub}`} />
      <p className={`font-bold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No targets set yet</p>
      <p className={`text-xs ${textSub}`}>Click "Edit Targets" to configure your daily goals before logging.</p>
      <button onClick={() => { setDraftTargets(targets); setEditTargets(true); }} className="px-4 py-2 rounded-xl bg-[#124F34] hover:bg-[#0D5C3A] text-white text-xs font-bold cursor-pointer">Set My Targets</button>
    </div>
  );

  const GoalBar = ({ label, consumed: c, target, pct: p, color }) => {
    const met = target > 0 && c >= target;
    return (
      <div className={`p-4 rounded-2xl ${cardBg} border ${met ? 'border-emerald-500/40' : ''}`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[11px] font-semibold ${textSub}`}>{label}</span>
          {met && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Goal Met!</span>}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`font-mono font-bold text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>{c}</span>
          {target > 0 && <span className={`text-xs ${textSub}`}>/ {target} {label === 'Calories' ? 'kcal' : 'g'}</span>}
          {target === 0 && <span className={`text-xs ${textSub}`}>no target</span>}
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${p}%` }} />
        </div>
        <span className={`text-[10px] font-mono ${textSub} mt-1 block`}>{target > 0 ? `${p}%` : '—'}</span>
      </div>
    );
  };

  return (
    <div className={`rounded-3xl border ${cardBg} p-6 space-y-6`}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E6F4ED] border border-[#C2E7D3] flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-[#124F34]" />
          </div>
          <div>
            <h2 className={`font-display font-black text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>Fitness & Nutrition</h2>
            <p className={`text-xs ${textSub}`}>Log workouts · Track macros · Hit goals for XP</p>
          </div>
        </div>
        <button
          onClick={() => { setDraftTargets(targets); setEditTargets(true); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          <Settings className="w-3.5 h-3.5" />Edit Targets
        </button>
      </div>

      {/* Reward notice */}
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E6F4ED] border border-[#C2E7D3] text-[#124F34] text-xs font-medium`}>
        <Gift className="w-4 h-4 text-[#10B981] shrink-0" />
        Complete 100% of a daily goal to earn <strong className="text-[#124F34] font-black ml-1">+50 XP & +15 Coins</strong>. Partial progress earns no XP.
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button className={`${tabBase} ${activeTab === 'workouts' ? tabActive : tabIdle}`} onClick={() => setActiveTab('workouts')}>
          <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" />Workouts</span>
        </button>
        <button className={`${tabBase} ${activeTab === 'nutrition' ? tabActive : tabIdle}`} onClick={() => setActiveTab('nutrition')}>
          <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" />Nutrition & Hydration</span>
        </button>
      </div>

      {/* ── Workouts Tab ── */}
      {activeTab === 'workouts' && (
        <div className="space-y-4">
          {/* Add workout form */}
          <form onSubmit={handleAddWorkout} className={`p-4 rounded-2xl ${cardBg} border space-y-3`}>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#124F34] shrink-0" />
              <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Log Exercise</span>
              <button
                type="button"
                onClick={() => { setShowManageEx(true); fetchCustomExercises(); }}
                className={`ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${isDark ? 'bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-300 border border-indigo-700/50' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200'}`}
              >
                <Pencil className="w-3 h-3" />Manage Exercises
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${textSub}`}>Exercise</label>
                <select
                  value={selectedExercise}
                  onChange={e => setSelectedExercise(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none focus:border-cyan-500 ${inputCls}`}
                >
                  {allExerciseOptions.length > 0 && (
                    <optgroup label="── Exercises ──">
                      {allExerciseOptions.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </optgroup>
                  )}
                  <option value={CUSTOM_OPTION}>{CUSTOM_OPTION}</option>
                </select>
              </div>

              {[
                { label: "Sets", value: setsInput, set: setSetsInput, min: 1 },
                { label: "Reps", value: repsInput, set: setRepsInput, min: 1 },
                { label: "Weight (kg)", value: weightInput, set: setWeightInput, min: 0 },
              ].map(f => (
                <div key={f.label} className="col-span-1">
                  <label className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${textSub}`}>{f.label}</label>
                  <input
                    type="number"
                    min={f.min}
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    placeholder={f.label}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none focus:border-cyan-500 ${inputCls}`}
                  />
                </div>
              ))}
            </div>

            {/* Custom Exercise Name Input (displayed when "Other / Custom Exercise..." is selected) */}
            {selectedExercise === CUSTOM_OPTION && (
              <div className="animate-fade-in pt-1">
                <label className="text-[11px] font-semibold block mb-1 text-cyan-300">Custom Exercise Name</label>
                <input
                  type="text"
                  autoFocus
                  value={customExerciseName}
                  onChange={e => setCustomExerciseName(e.target.value)}
                  placeholder="e.g. Antigravity Pull-ups, Kettlebell Swings, Cable Flyes..."
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 ${inputCls}`}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#124F34] hover:bg-[#0D5C3A] text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />+ Log Exercise
            </button>
          </form>

          {/* Workout list */}
          <div className="space-y-2">
            {workouts.length === 0 && (
              <p className={`text-center text-xs py-6 ${textSub}`}>No exercises logged today. Add one above.</p>
            )}
            {(workouts || []).map((w, i) => {
              const displayName = w.exercise || w.exerciseName || w.name || "Custom Exercise";
              return (
                <div key={i} className={`p-3.5 rounded-2xl ${cardBg} border flex items-center justify-between gap-3 hover:border-cyan-500/40 transition-colors`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-[#124F34] flex items-center justify-center font-bold text-xs border border-cyan-500/20">#{i + 1}</div>
                    <div>
                      <h4 className={`font-display font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{displayName}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{w.sets} Sets &times; {w.reps} Reps @ <strong className="text-cyan-300">{w.weight} kg</strong></p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveWorkout(i)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete exercise log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Nutrition & Hydration Tab ── */}
      {activeTab === 'nutrition' && (
        <div className="space-y-6">

          {/* Macro Progress */}
          {targets.calories === 0 && targets.protein === 0 ? (
            <NeedConfig />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <GoalBar label="Calories" consumed={consumed.calories} target={targets.calories} pct={calPct}  color="bg-amber-400" />
              <GoalBar label="Protein"  consumed={consumed.protein}  target={targets.protein}  pct={proPct}  color="bg-rose-400"  />
              <GoalBar label="Carbs"    consumed={consumed.carbs}    target={targets.carbs}    pct={carbPct} color="bg-cyan-400"  />
              <GoalBar label="Fats"     consumed={consumed.fats}     target={targets.fats}     pct={fatPct}  color="bg-emerald-400" />
            </div>
          )}

          {/* Quick Meal Logger */}
          <form onSubmit={handleAddMeal} className={`p-4 rounded-2xl ${cardBg} border space-y-3`}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#124F34]" />
              <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Log a Meal</span>
              <span className={`text-[10px] ml-auto ${textSub}`}>No XP until daily goal reached</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Calories', val: mealCal, set: setMealCal, placeholder: 'kcal (e.g. 450)' },
                { label: 'Protein g', val: mealPro, set: setMealPro, placeholder: 'g (e.g. 35)' },
                { label: 'Carbs g', val: mealCarb, set: setMealCarb, placeholder: 'g (e.g. 60)' },
                { label: 'Fats g', val: mealFat, set: setMealFat, placeholder: 'g (e.g. 12)' },
              ].map(f => (
                <div key={f.label}>
                  <label className={`text-[11px] font-semibold block mb-1 ${textSub}`}>{f.label}</label>
                  <input type="number" min={0} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none focus:border-cyan-500 ${inputCls}`} />
                </div>
              ))}
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-[#124F34] hover:bg-[#0D5C3A] text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" />Add to Today's Log
            </button>
          </form>

          {/* Hydration */}
          <div className={`p-5 rounded-2xl ${cardBg} border`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`font-display font-bold text-sm text-cyan-300 flex items-center gap-1.5`}>
                <Droplet className="w-4 h-4" />Water Intake
              </span>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs font-bold ${textSub}`}>{waterMl} ml / {targets.waterMl > 0 ? `${targets.waterMl} ml` : 'no target'}</span>
                {targets.waterMl > 0 && waterMl >= targets.waterMl && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Done!</span>
                )}
              </div>
            </div>

            {/* Water progress bar */}
            <div className="relative h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/60 mb-4">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-blue-400 transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" style={{ width: `${watPct}%` }} />
            </div>

            {/* Quick add buttons */}
            <div className="flex flex-wrap gap-2">
              {[250, 500, 1000].map(ml => (
                <button
                  key={ml}
                  onClick={() => handleDrinkWater(ml)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#124F34] hover:bg-[#0D5C3A] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Droplet className="w-3.5 h-3.5" />+{ml}ml
                </button>
              ))}
              {waterMl > 0 && (
                <button onClick={() => setWaterMl(0)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}>
                  Reset
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ── Manage Exercises Modal ── */}
      {showManageEx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-md ${isDark ? 'bg-[#0d1322] border-indigo-500/30' : 'bg-white border-slate-200'} border rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]`}>
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} mb-4`}>
              <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Dumbbell className="w-4 h-4 text-[#124F34]" />Exercise Manager
              </h3>
              <button onClick={() => setShowManageEx(false)} className={`${textSub} cursor-pointer`}><X className="w-5 h-5" /></button>
            </div>

            {/* Add new exercise */}
            <form onSubmit={handleAddCustomExercise} className="space-y-2 mb-4">
              <p className={`text-[11px] font-semibold ${textSub} uppercase tracking-wider`}>Add Custom Exercise</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newExName}
                  onChange={e => setNewExName(e.target.value)}
                  placeholder="e.g. Antigravity Pull-ups"
                  className={`flex-1 px-3 py-2 rounded-xl border text-xs outline-none focus:border-cyan-500 ${inputCls}`}
                  required
                />
                <select
                  value={newExCategory}
                  onChange={e => setNewExCategory(e.target.value)}
                  className={`px-2 py-2 rounded-xl border text-xs outline-none focus:border-cyan-500 ${inputCls}`}
                >
                  {['Strength','Cardio','Flexibility','HIIT','Sports','Other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={exSaving || !newExName.trim()}
                className="w-full py-2 rounded-xl bg-[#124F34] hover:bg-[#0D5C3A] disabled:opacity-50 text-white font-bold text-xs shadow transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {exSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {exSaving ? 'Saving...' : 'Add Exercise'}
              </button>
            </form>

            {/* Divider */}
            <div className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-100'} mb-3`} />

            {/* Exercise list */}
            <p className={`text-[11px] font-semibold ${textSub} uppercase tracking-wider mb-2`}>Your Custom Exercises ({customExercises.length})</p>
            <div className="overflow-y-auto flex-1 space-y-1.5 pr-1">
              {exLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-[#124F34]" />
                </div>
              )}
              {!exLoading && customExercises.length === 0 && (
                <p className={`text-center text-xs py-6 ${textSub}`}>No custom exercises yet. Add one above!</p>
              )}
              {!exLoading && customExercises.map(ex => (
                <div
                  key={ex._id}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200'} transition-colors`}
                >
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{ex.name}</p>
                    <p className={`text-[10px] ${textSub}`}>{ex.category}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCustomExercise(ex._id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete custom exercise"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Preset hint */}
            <div className={`mt-4 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <p className={`text-[10px] ${textSub}`}>
                <strong className="text-[#124F34]">{PRESET_EXERCISES.length} built-in presets</strong> + {customExercises.length} custom exercises are available in your Log Exercise dropdown.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Targets Modal ── */}
      {editTargets && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-md ${isDark ? 'bg-[#0d1322] border-indigo-500/30' : 'bg-white border-slate-200'} border rounded-3xl p-6 shadow-2xl`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} mb-4`}>
              <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Settings className="w-4 h-4 text-indigo-400" />Daily Target Goals
              </h3>
              <button onClick={() => setEditTargets(false)} className={`${textSub} cursor-pointer`}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveTargets} className="space-y-4">
              <p className={`text-xs ${textSub}`}>These targets persist across days and only change when you edit them here. Daily consumed values reset at midnight.</p>
              {[
                { label: 'Daily Calorie Goal (kcal)',  key: 'calories', placeholder: 'e.g. 2500' },
                { label: 'Protein Target (g)',          key: 'protein',  placeholder: 'e.g. 150'  },
                { label: 'Carbs Target (g)',            key: 'carbs',    placeholder: 'e.g. 300'  },
                { label: 'Fats Target (g)',             key: 'fats',     placeholder: 'e.g. 70'   },
                { label: 'Water Goal (ml)',             key: 'waterMl',  placeholder: 'e.g. 3000' },
              ].map(f => (
                <div key={f.key}>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{f.label}</label>
                  <input
                    type="number" min={0}
                    value={draftTargets[f.key] || ''}
                    onChange={e => setDraftTargets(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:border-indigo-500 ${inputCls}`}
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditTargets(false)} className={`px-4 py-2 text-xs font-semibold ${textSub} cursor-pointer`}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#124F34] hover:bg-[#0D5C3A] text-white text-xs font-black shadow cursor-pointer">Save Targets</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
