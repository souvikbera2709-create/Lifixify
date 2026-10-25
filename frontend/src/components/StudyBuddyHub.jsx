import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { api } from "../services/api";
import { sounds } from "../utils/soundEffects";
import {
  GraduationCap,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  Coffee,
  Trash2,
  Plus,
  Sliders,
  Check,
  X,
  BookmarkCheck
} from "lucide-react";

const DEFAULT_PRESETS = [
  { id: "p-25", label: "25m Sprint", minutes: 25, type: "focus" },
  { id: "p-50", label: "50m Deep Work", minutes: 50, type: "focus" },
  { id: "p-5",  label: "5m Short Break", minutes: 5, type: "break" },
  { id: "p-15", label: "15m Long Break", minutes: 15, type: "break" }
];

export const StudyBuddyHub = () => {
  const { addXp, addCoins, isDark, recordQualifyingActivity } = useStore();

  // Custom Preset State from localStorage
  const [customPreset, setCustomPreset] = useState(() => {
    try {
      const saved = localStorage.getItem("lifixify_custom_timer");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Selected Preset
  const [selectedPreset, setSelectedPreset] = useState(() => {
    try {
      const saved = localStorage.getItem("lifixify_custom_timer");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isDefault) return parsed;
      }
    } catch {}
    return DEFAULT_PRESETS[0];
  });

  const [secondsLeft, setSecondsLeft] = useState(() => {
    try {
      const saved = localStorage.getItem("lifixify_custom_timer");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isDefault) return parsed.minutes * 60;
      }
    } catch {}
    return 25 * 60;
  });

  const [isActive, setIsActive] = useState(false);
  const [subject, setSubject] = useState("Deep Work");
  const [sessionNotes, setSessionNotes] = useState("");

  // Custom Duration Modal / Popover State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(35);
  const [customLabel, setCustomLabel] = useState("");
  const [customType, setCustomType] = useState("focus");
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  // Study statistics and logs
  const [recentSessions, setRecentSessions] = useState([]);
  const [stats, setStats] = useState({
    totalMinutes: 0,
    totalHours: "0.0",
    totalSessions: 0
  });

  const fetchStudyData = async () => {
    try {
      const statsData = await api.study.getStats();
      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      }
      const logsData = await api.study.getLogs(20);
      if (logsData.success && logsData.logs) {
        setRecentSessions(logsData.logs);
      }
    } catch (e) {
      console.log("Using local study state");
    }
  };

  useEffect(() => {
    fetchStudyData();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    let timer = null;
    if (isActive && secondsLeft > 0) {
      timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    } else if (secondsLeft === 0 && isActive) {
      handleCompleteSession();
    }
    return () => clearInterval(timer);
  }, [isActive, secondsLeft]);

  const handleSelectPreset = (preset) => {
    sounds.playClick();
    setIsActive(false);
    setSelectedPreset(preset);
    setSecondsLeft(preset.minutes * 60);
  };

  const handleToggleTimer = () => {
    sounds.playClick();
    setIsActive(!isActive);
  };

  const handleReset = () => {
    sounds.playClick();
    setIsActive(false);
    setSecondsLeft(selectedPreset.minutes * 60);
  };

  // Apply custom preset
  const handleApplyCustomPreset = (e) => {
    e?.preventDefault();
    const mins = Math.max(1, Math.min(240, Number(customMinutes) || 25));
    const label = customLabel.trim() || `${mins}m Custom ${customType === "focus" ? "Sprint" : "Break"}`;

    const newPreset = {
      id: "custom-preset",
      label,
      minutes: mins,
      type: customType,
      isDefault: saveAsDefault
    };

    setCustomPreset(newPreset);
    setSelectedPreset(newPreset);
    setSecondsLeft(mins * 60);
    setIsActive(false);

    if (saveAsDefault) {
      localStorage.setItem("lifixify_custom_timer", JSON.stringify(newPreset));
    } else {
      localStorage.setItem("lifixify_custom_timer", JSON.stringify({ ...newPreset, isDefault: false }));
    }

    setShowCustomModal(false);
  };

  const handleCompleteSession = async () => {
    setIsActive(false);
    sounds.playLevelUp();
    const duration = selectedPreset.minutes;
    const isBreak = selectedPreset.type === "break";
    const sessionSubject = subject.trim() || "Deep Work";

    if (!isBreak) {
      try { recordQualifyingActivity(); } catch {}
      const xpEarned = duration;
      const coinsEarned = Math.max(1, Math.floor(duration / 10));

      addXp(xpEarned);
      addCoins(coinsEarned);

      try {
        const res = await api.study.logSession({
          subject: sessionSubject,
          durationMinutes: duration,
          notes: sessionNotes.trim()
        });
        if (res.success && res.log) {
          setRecentSessions(prev => [res.log, ...prev]);
        } else {
          setRecentSessions(prev => [{
            _id: `s-${Date.now()}`,
            subject: sessionSubject,
            durationMinutes: duration,
            xpEarned,
            coinsEarned,
            completedAt: new Date()
          }, ...prev]);
        }
      } catch (e) {
        setRecentSessions(prev => [{
          _id: `s-${Date.now()}`,
          subject: sessionSubject,
          durationMinutes: duration,
          xpEarned,
          coinsEarned,
          completedAt: new Date()
        }, ...prev]);
      }

      setStats((prev) => ({
        ...prev,
        totalMinutes: prev.totalMinutes + duration,
        totalHours: ((prev.totalMinutes + duration) / 60).toFixed(1),
        totalSessions: prev.totalSessions + 1
      }));

      alert(`🎓 Focus session completed! Earned +${xpEarned} XP and +${coinsEarned} Coins!`);
    } else {
      alert("☕ Break completed! Ready for the next deep work sprint?");
    }

    setSecondsLeft(selectedPreset.minutes * 60);
  };

  const handleDeleteSession = async (sessionId) => {
    sounds.playClick();
    const sessionToDelete = recentSessions.find(s => s._id === sessionId);
    setRecentSessions(prev => prev.filter(s => s._id !== sessionId));
    if (sessionToDelete) {
      setStats(prev => {
        const newTotalMins = Math.max(0, prev.totalMinutes - (sessionToDelete.durationMinutes || 0));
        return {
          ...prev,
          totalMinutes: newTotalMins,
          totalHours: (newTotalMins / 60).toFixed(1),
          totalSessions: Math.max(0, prev.totalSessions - 1)
        };
      });
    }

    try {
      if (sessionId && !sessionId.toString().startsWith("s-")) {
        await api.study.deleteLog(sessionId);
      }
    } catch (err) {
      console.error("Failed to delete study log from backend:", err);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const totalPresetSeconds = selectedPreset.minutes * 60;
  const progressPercent = Math.round(((totalPresetSeconds - secondsLeft) / totalPresetSeconds) * 100);

  // All presets combined
  const allPresets = customPreset
    ? [...DEFAULT_PRESETS, customPreset]
    : DEFAULT_PRESETS;

  return (
    <div className={`rounded-3xl p-6 border transition-all ${isDark ? 'bg-[#111e18] border-[#1a2f26]' : 'bg-white border-[#EEF2F0] shadow-[0_4px_20px_rgba(0,0,0,0.03)]'}`}>
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b ${isDark ? 'border-[#1a2f26]' : 'border-[#EEF2F0]'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#124F34] to-[#10B981] flex items-center justify-center text-white shadow-md shadow-emerald-950/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-display font-black text-xl ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                Study Buddy & Focus Hub
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F4ED] text-[#124F34] border border-[#C2E7D3]">
                Pomodoro Chamber
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Execute deep work sprints, log custom subjects, and earn real-time focus XP
            </p>
          </div>
        </div>

        {/* Aggregate Focus Hours */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-2xl bg-[#E6F4ED] text-[#124F34] border border-[#C2E7D3] text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-[#10B981]" />
            Total: {stats.totalHours} hrs ({stats.totalSessions} Sessions)
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Left Column: Pomodoro Chamber */}
        <div className={`lg:col-span-2 rounded-2xl p-6 border flex flex-col justify-between ${isDark ? 'bg-[#14261f] border-[#1a2f26]' : 'bg-[#F9FCFA] border-[#EEF2F0]'}`}>
          <div>
            {/* Presets Row */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {allPresets.map((p) => {
                const isSelected = selectedPreset.label === p.label && selectedPreset.minutes === p.minutes;
                return (
                  <button
                    key={p.id || p.label}
                    onClick={() => handleSelectPreset(p)}
                    className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#124F34] text-white shadow-md shadow-emerald-950/25 ring-1 ring-[#124F34]"
                        : isDark
                          ? "bg-[#111e18] border border-[#1a2f26] text-slate-300 hover:text-white"
                          : "bg-white border border-[#EEF2F0] text-[#6B7280] hover:text-[#124F34] hover:bg-[#E6F4ED]"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}

              {/* + Custom Button */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowCustomModal(true);
                }}
                className="px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-[#E6F4ED] text-[#124F34] hover:bg-[#C2E7D3] border border-[#C2E7D3] transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Custom
              </button>
            </div>

            {/* Custom Subject Input */}
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className={`text-xs font-bold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-[#111827]'}`}>
                Target Subject:
              </span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Type custom subject or focus topic..."
                className={`flex-1 px-3.5 py-2 rounded-2xl text-xs outline-none transition-all border ${
                  isDark
                    ? "bg-[#111e18] border-[#1a2f26] text-white focus:border-[#10B981]"
                    : "bg-white border-[#EEF2F0] text-[#111827] focus:border-[#124F34] focus:ring-1 focus:ring-[#124F34]"
                }`}
              />
            </div>

            {/* Digital Clock Chamber */}
            <div className={`relative py-9 rounded-2xl border flex flex-col items-center justify-center shadow-inner overflow-hidden ${
              isDark 
                ? "bg-[#0f1d16] border-[#1a2f26]" 
                : "bg-white border-[#EEF2F0]"
            }`}>
              <div className="text-center z-10">
                <span className={`font-mono text-6xl font-black tracking-wider ${isDark ? 'text-emerald-400' : 'text-[#124F34]'}`}>
                  {formattedTime}
                </span>
                <p className="text-xs text-[#6B7280] font-semibold mt-2 flex items-center justify-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>{subject.trim() || "Deep Work"}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E6F4ED] text-[#124F34] font-mono">
                    +{selectedPreset.minutes} XP
                  </span>
                </p>
              </div>

              {/* Dynamic Bottom Progress Track */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#E5E7EB]">
                <div
                  className="h-full bg-gradient-to-r from-[#124F34] via-[#0D5C3A] to-[#10B981] transition-all duration-1000 ease-linear shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleToggleTimer}
              className={`w-full sm:flex-1 py-3 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 ${
                isActive
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/20"
                  : "bg-[#124F34] hover:bg-[#0D5C3A] text-white shadow-emerald-950/20"
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Sprint</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Focus Sprint</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                isDark
                  ? "bg-[#111e18] border-[#1a2f26] text-slate-300 hover:text-white"
                  : "bg-white border-[#EEF2F0] text-[#6B7280] hover:text-[#124F34] hover:bg-[#E6F4ED]"
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleCompleteSession}
              disabled={!isActive && secondsLeft === selectedPreset.minutes * 60}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-bold bg-[#E6F4ED] hover:bg-[#C2E7D3] text-[#124F34] border border-[#C2E7D3] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Complete Now (+{selectedPreset.minutes} XP)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Recent Focus Sessions History */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#6B7280]">
            <span>Completed Sprints</span>
            <span className="font-mono text-[#124F34] bg-[#E6F4ED] px-2 py-0.5 rounded-full border border-[#C2E7D3]">
              {recentSessions.length} Logged
            </span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 flex-1">
            {recentSessions.map((session) => (
              <div
                key={session._id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between group shadow-sm ${
                  isDark
                    ? "bg-[#14261f] border-[#1a2f26]"
                    : "bg-[#FFFFFF] border-[#EEF2F0] hover:border-[#C2E7D3]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E6F4ED] border border-[#C2E7D3] flex items-center justify-center text-[#124F34] shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`font-bold text-xs truncate max-w-[140px] ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                      {session.subject}
                    </p>
                    <p className="text-[10px] text-[#6B7280] flex items-center gap-1">
                      <span>{session.durationMinutes} min sprint</span>
                      <span>·</span>
                      <span className="text-[#124F34] font-bold font-mono">+{session.xpEarned || session.durationMinutes} XP</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                    +{session.coinsEarned || Math.max(1, Math.floor(session.durationMinutes / 10))} C
                  </span>
                  <button
                    onClick={() => handleDeleteSession(session._id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Delete log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {recentSessions.length === 0 && (
              <div className={`text-center py-10 px-4 rounded-2xl border border-dashed ${isDark ? 'border-[#1a2f26]' : 'border-[#EEF2F0]'}`}>
                <GraduationCap className="w-8 h-8 text-[#10B981] mx-auto mb-2 opacity-50" />
                <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-[#111827]'}`}>No Focus Sprints Yet</p>
                <p className="text-[11px] text-[#6B7280] mt-1">
                  Start your first Pomodoro session to log focus hours and earn rank XP!
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Custom Focus Timer Duration Modal ── */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md ${isDark ? 'bg-[#111e18] border-[#1a2f26]' : 'bg-white border-[#EEF2F0]'} border rounded-3xl p-6 shadow-2xl`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-[#1a2f26]' : 'border-[#EEF2F0]'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E6F4ED] border border-[#C2E7D3] flex items-center justify-center text-[#124F34]">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-display font-black text-base ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                    Set Custom Timer Duration
                  </h3>
                  <p className="text-xs text-[#6B7280]">Configure custom focus or break lengths</p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-[#6B7280] hover:text-[#111827] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleApplyCustomPreset} className="space-y-4 mt-4">
              {/* Duration input */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#111827]'}`}>
                  Target Duration (Minutes)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className={`flex-1 px-4 py-2.5 rounded-2xl border text-sm font-mono font-bold outline-none ${
                      isDark 
                        ? 'bg-[#14261f] border-[#1a2f26] text-white focus:border-[#10B981]' 
                        : 'bg-[#F4F6F5] border-[#EEF2F0] text-[#111827] focus:border-[#124F34]'
                    }`}
                  />
                  <span className="text-xs font-bold text-[#6B7280]">min</span>
                </div>

                {/* Quick duration pills */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {[10, 20, 30, 45, 60, 90].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCustomMinutes(m)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        customMinutes === m
                          ? "bg-[#124F34] text-white"
                          : isDark
                            ? "bg-[#14261f] text-slate-300 hover:text-white"
                            : "bg-[#E6F4ED] text-[#124F34] hover:bg-[#C2E7D3]"
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Preset Name */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#111827]'}`}>
                  Preset Label (Optional)
                </label>
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder={`e.g. ${customMinutes}m Focused Reading`}
                  className={`w-full px-4 py-2.5 rounded-2xl border text-xs outline-none ${
                    isDark 
                      ? 'bg-[#14261f] border-[#1a2f26] text-white focus:border-[#10B981]' 
                      : 'bg-[#F4F6F5] border-[#EEF2F0] text-[#111827] focus:border-[#124F34]'
                  }`}
                />
              </div>

              {/* Session Type */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#111827]'}`}>
                  Session Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomType("focus")}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      customType === "focus"
                        ? "bg-[#124F34] text-white border-[#124F34] shadow-sm"
                        : isDark
                          ? "bg-[#14261f] border-[#1a2f26] text-slate-400"
                          : "bg-[#F4F6F5] border-[#EEF2F0] text-[#6B7280]"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Focus Sprint (+XP)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomType("break")}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      customType === "break"
                        ? "bg-[#124F34] text-white border-[#124F34] shadow-sm"
                        : isDark
                          ? "bg-[#14261f] border-[#1a2f26] text-slate-400"
                          : "bg-[#F4F6F5] border-[#EEF2F0] text-[#6B7280]"
                    }`}
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Rest Break</span>
                  </button>
                </div>
              </div>

              {/* Save as Default Toggle */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer ${
                isDark ? 'bg-[#14261f] border-[#1a2f26]' : 'bg-[#F9FCFA] border-[#EEF2F0]'
              }`} onClick={() => setSaveAsDefault(!saveAsDefault)}>
                <div className="flex items-center gap-2">
                  <BookmarkCheck className={`w-4 h-4 ${saveAsDefault ? 'text-[#10B981]' : 'text-[#6B7280]'}`} />
                  <div>
                    <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                      Save as Default Preset
                    </p>
                    <p className="text-[10px] text-[#6B7280]">
                      Persist in browser storage for future sessions
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                  saveAsDefault ? 'bg-[#124F34] border-[#124F34] text-white' : 'border-[#D1D5DB] bg-white'
                }`}>
                  {saveAsDefault && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6B7280] hover:text-[#111827] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#124F34] hover:bg-[#0D5C3A] text-white text-xs font-bold shadow-md shadow-emerald-950/20 cursor-pointer transition-all"
                >
                  Apply {customMinutes}m Timer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
