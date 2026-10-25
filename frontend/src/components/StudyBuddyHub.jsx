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
  Trash2
} from "lucide-react";

const TIMER_PRESETS = [
  { label: "25m Sprint", minutes: 25, type: "focus" },
  { label: "50m Deep Work", minutes: 50, type: "focus" },
  { label: "5m Short Break", minutes: 5, type: "break" },
  { label: "15m Long Break", minutes: 15, type: "break" }
];

export const StudyBuddyHub = () => {
  const { addXp, addCoins } = useStore();
  const [selectedPreset, setSelectedPreset] = useState(TIMER_PRESETS[0]);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [subject, setSubject] = useState("Deep Work");
  const [sessionNotes, setSessionNotes] = useState("");

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
    setIsActive(false);
    setSelectedPreset(preset);
    setSecondsLeft(preset.minutes * 60);
  };

  const handleToggleTimer = () => setIsActive(!isActive);

  const handleReset = () => {
    setIsActive(false);
    setSecondsLeft(selectedPreset.minutes * 60);
  };

  const handleCompleteSession = async () => {
    setIsActive(false);
    const duration = selectedPreset.minutes;
    const isBreak = selectedPreset.type === "break";
    const sessionSubject = subject.trim() || "Deep Work";

    if (!isBreak) {
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

  return (
    <div className="glass-card rounded-3xl p-6 border-t-2 border-t-indigo-500 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              Study Buddy & Focus Hub
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Pomodoro Chamber
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Type custom subjects, execute deep work sprints, and award real-time focus XP
            </p>
          </div>
        </div>

        {/* Aggregate Focus Hours */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-950/40 text-indigo-400 border border-indigo-500/30">
            Total Focus: {stats.totalHours} hrs ({stats.totalSessions} Sessions)
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Left Column: Interactive Pomodoro Timer Chamber */}
        <div className="lg:col-span-2 bg-[#090d16] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            {/* Preset Selector */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {TIMER_PRESETS.map((p) => {
                const isSelected = selectedPreset.label === p.label;
                return (
                  <button
                    key={p.label}
                    onClick={() => handleSelectPreset(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400"
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Subject Input */}
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs font-bold text-slate-300 whitespace-nowrap">Target Subject:</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Type custom subject or focus topic..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Big Digital Clock Display */}
            <div className="relative py-8 rounded-2xl bg-gradient-to-b from-[#0e1424] to-[#070b13] border border-indigo-900/40 flex flex-col items-center justify-center shadow-inner overflow-hidden">
              <div className="text-center z-10">
                <span className="font-mono text-6xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                  {formattedTime}
                </span>
                <p className="text-xs text-indigo-300 font-semibold mt-2 flex items-center justify-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{subject.trim() || "Deep Work"}</span>
                </p>
              </div>

              {/* Progress track at bottom of timer */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="mt-5 pt-3 border-t border-slate-800 flex items-center gap-3">
            <button
              onClick={handleToggleTimer}
              className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg ${
                isActive
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/25"
              }`}
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isActive ? "Pause Focus Session" : "Start Focus Session"}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleCompleteSession}
              className="px-4 py-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            >
              ✓ Complete Now (+{selectedPreset.minutes} XP)
            </button>
          </div>
        </div>

        {/* Right Column: Recent Focus Sessions History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Completed Focus Sprints</span>
            <span className="font-mono text-indigo-400">{recentSessions.length} Logged</span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {recentSessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No focus sprints logged yet. Start the timer to complete your first sprint!
              </div>
            ) : (
              recentSessions.map((session) => (
                <div
                  key={session._id}
                  className="group p-3 rounded-xl bg-[#090d16] border border-slate-800 flex items-center justify-between gap-3 hover:border-indigo-500/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <h5 className="font-bold text-xs text-white truncate">{session.subject || "Deep Work"}</h5>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {session.durationMinutes} mins completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                      +{session.xpEarned || session.durationMinutes} XP
                    </span>
                    <button
                      onClick={() => handleDeleteSession(session._id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete session record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
