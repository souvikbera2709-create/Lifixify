import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import {
  Activity, Dumbbell, Droplet, Flame,
  Plus, Trash2, CheckCircle2, TrendingUp,
  Settings, X, Zap, Coins, Gift
} from 'lucide-react';

const PRESET_EXERCISES = [
  'Barbell Bench Press','Barbell Back Squat','Deadlift',
  'Weighted Pull-ups','Overhead Press','Incline Dumbbell Press','Barbell Row'
];

const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

// Keys for localStorage persistence
const KEY_TARGETS = 'lifixify_fitness_targets';
const KEY_CONSUMED = 'lifixify_fitness_consumed_';
const KEY_WATER    = 'lifixify_water_';

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
  const [workouts,       setWorkouts]       = useState([]);
  const [exerciseInput,  setExerciseInput]  = useState(PRESET_EXERCISES[0]);
  const [setsInput,      setSetsInput]      = useState(3);
  const [repsInput,      setRepsInput]      = useState(10);
  const [weightInput,    setWeightInput]    = useState(60);

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

  // Sync from backend once
  useEffect(() => {
    api.fitness.getToday().then(data => {
      if (data.success && data.log) {
        if (data.log.workouts?.length) setWorkouts(data.log.workouts);
      }
    }).catch(() => {});
  }, []);

  // Persist consumed on change
  useEffect(() => { saveConsumed(consumed); }, [consumed]);
  useEffect(() => { saveWater(waterMl); }, [waterMl]);

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
    if (!exerciseInput.trim()) return;
    const entry = { exercise: exerciseInput.trim(), sets: +setsInput || 1, reps: +repsInput || 10, weight: +weightInput || 0 };
    const updated = [...workouts, entry];
    setWorkouts(updated);
    try {
      await api.fitness.logWorkout({ workouts: updated });
    } catch {}
  };

  const handleRemoveWorkout = (idx) => setWorkouts(w => w.filter((_, i) => i !== idx));

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
  const cardBg  = isDark ? 'bg-[#090d16] border-slate-800/80' : 'bg-white border-slate-200';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900';
  const tabBase  = 'px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer';
  const tabActive = 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow';
  const tabIdle   = isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100';

  const NeedConfig = () => (
    <div className={`p-6 rounded-2xl ${cardBg} border border-dashed border-slate-600 text-center space-y-3`}>
      <Settings className={`w-8 h-8 mx-auto ${textSub}`} />
      <p className={`font-bold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No targets set yet</p>
      <p className={`text-xs ${textSub}`}>Click "Edit Targets" to configure your daily goals before logging.</p>
      <button onClick={() => { setDraftTargets(targets); setEditTargets(true); }} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer">Set My Targets</button>
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
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-cyan-400" />
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
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-950/30 border border-amber-700/30 text-amber-300 text-xs font-medium`}>
        <Gift className="w-4 h-4 text-amber-400 shrink-0" />
        Complete 100% of a daily goal to earn <strong className="text-amber-400 ml-1">+50 XP & +15 Coins</strong>. Partial progress earns no XP.
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
          <form onSubmit={handleAddWorkout} className={`p-4 rounded-2xl ${cardBg} border grid grid-cols-2 sm:grid-cols-4 gap-3`}>
            <div className="col-span-2 sm:col-span-4 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Log Exercise</span>
            </div>
            <select value={exerciseInput} onChange={e => setExerciseInput(e.target.value)} className={`col-span-2 sm:col-span-1 px-3 py-2 rounded-xl border text-xs outline-none ${inputCls}`}>
              {PRESET_EXERCISES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>
            {[
              { label: 'Sets', value: setsInput, set: setSetsInput, min: 1 },
              { label: 'Reps', value: repsInput, set: setRepsInput, min: 1 },
              { label: 'Weight (kg)', value: weightInput, set: setWeightInput, min: 0 },
            ].map(f => (
              <input key={f.label} type="number" min={f.min} value={f.value}
                onChange={e => f.set(e.target.value)}
                placeholder={f.label}
                className={`px-3 py-2 rounded-xl border text-xs outline-none focus:border-cyan-500 ${inputCls}`}
              />
            ))}
            <button type="submit" className="col-span-2 sm:col-span-4 w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" />Log Exercise
            </button>
          </form>

          {/* Workout list */}
          <div className="space-y-2">
            {workouts.length === 0 && (
              <p className={`text-center text-xs py-6 ${textSub}`}>No exercises logged today. Add one above.</p>
            )}
            {(workouts || []).map((w, i) => (
              <div key={i} className={`p-3.5 rounded-2xl ${cardBg} border flex items-center justify-between gap-3 hover:border-cyan-500/40 transition-colors`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/20">#{i + 1}</div>
                  <div>
                    <h4 className={`font-display font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{w.exercise}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{w.sets} Sets &times; {w.reps} Reps @ <strong className="text-cyan-300">{w.weight} kg</strong></p>
                  </div>
                </div>
                <button onClick={() => handleRemoveWorkout(i)} className="p-1 rounded text-slate-500 hover:text-rose-400 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
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
              <TrendingUp className="w-4 h-4 text-cyan-400" />
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
            <button type="submit" className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer">
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
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
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
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow cursor-pointer">Save Targets</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
