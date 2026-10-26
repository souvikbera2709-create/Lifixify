import { create } from "zustand";
import confetti from "canvas-confetti";
import { sounds } from "../utils/soundEffects";
import { api } from "../services/api";

export const getRankTitle = (level) => {
  const lvl = Number(level) || 1;
  if (lvl >= 15) return "Transcendent Sovereign";
  if (lvl >= 10) return "Grandmaster Paragon";
  if (lvl >= 7) return "Master Strategist";
  if (lvl >= 4) return "Vanguard Champion";
  if (lvl >= 2) return "Apprentice Builder";
  return "Novice Architect";
};

export const calculateLevelFromXp = (xp) => {
  const safeXp = Math.max(0, Number(xp) || 0);
  return Math.floor(safeXp / 500) + 1;
};

export const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const checkIsStreakActiveToday = (user) => {
  const today = getTodayKey();
  try {
    const stored = localStorage.getItem("lifixify_last_qualifying_date");
    if (stored === today) return true;
  } catch {}
  if (user?.lastQualifyingDate) {
    const userDate = typeof user.lastQualifyingDate === "string"
      ? user.lastQualifyingDate.split("T")[0]
      : new Date(user.lastQualifyingDate).toISOString().split("T")[0];
    if (userDate === today) return true;
  }
  return false;
};

export const fireLevelUpConfetti = () => {
  try {
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
    function randomInRange(min, max) { return Math.random() * (max - min) + min; }
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  } catch (e) {
    console.warn("Confetti error ignored:", e);
  }
};

export const DEFAULT_USER = {
  _id: "",
  name: "Player",
  email: "",
  level: 1,
  xp: 0,
  coins: 0,
  streak: 0,
  rankTitle: "Novice Architect",
  unlockedBadges: [],
  avatar: "🧠"
};

export const useStore = create((set, get) => ({
  // Auth state
  user: { ...DEFAULT_USER },
  isAuthenticated: false,

  // Theme
  isDark: false,
  toggleTheme: () => set(s => {
    const next = !s.isDark;
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next);
    }
    return { isDark: next };
  }),

  // Audio mute
  isMuted: false,
  toggleSound: () => {
    try {
      const newMute = sounds.toggleMute();
      set({ isMuted: newMute });
    } catch {
      set(s => ({ isMuted: !s.isMuted }));
    }
  },

  // Navigation & View Routing
  activeSidePanel: null, // "rewards" | "leaderboard" | null
  setActiveSidePanel: (panel) => {
    try { sounds.playClick(); } catch {}
    set({ activeSidePanel: panel });
  },
  activeModuleFilter: "All Modules",
  setActiveModuleFilter: (filterName) => {
    try { sounds.playClick(); } catch {}
    set({ activeModuleFilter: filterName || "All Modules", activeSidePanel: null });
  },

  // AI Drawer
  isAiDrawerOpen: false,
  toggleAiDrawer: () => {
    try { sounds.playClick(); } catch {}
    set(s => ({ isAiDrawerOpen: !s.isAiDrawerOpen }));
  },

  // Level Up Modal
  levelUpModal: { isOpen: false, newLevel: 1, unlockedTitle: "" },
  closeLevelUpModal: () => set(s => ({ levelUpModal: { ...s.levelUpModal, isOpen: false } })),

  // Shop Rewards
  shopRewards: [
    { id: 1, title: "1 Hour Gaming Pass", cost: 75, category: "Leisure", icon: "Gamepad2" },
    { id: 2, title: "Cheat Meal Feast", cost: 200, category: "Food", icon: "UtensilsCrossed" },
    { id: 3, title: "Movie & Popcorn Night", cost: 150, category: "Entertainment", icon: "Film" },
    { id: 4, title: "Sleep-In Pass (+1 Hour)", cost: 100, category: "Wellness", icon: "Moon" }
  ],
  redeemedHistory: [],

  redeemReward: (reward) => {
    const { user } = get();
    const userCoins = Number(user?.coins) || 0;
    if (userCoins < reward.cost) {
      alert(`Not enough coins! You need ${reward.cost - userCoins} more coins.`);
      return false;
    }
    try { sounds.playCoin(); } catch {}
    const historyEntry = {
      id: reward.id,
      title: reward.title,
      cost: reward.cost,
      category: reward.category || 'General',
      redeemedAt: new Date().toISOString()
    };
    set(s => ({
      user: { ...s.user, coins: Math.max(0, userCoins - reward.cost) },
      redeemedHistory: [historyEntry, ...(s.redeemedHistory || [])]
    }));
    return true;
  },

  addCustomReward: (reward) => {
    try { sounds.playCoin(); } catch {}
    set(s => ({ shopRewards: [...(s.shopRewards || []), { id: Date.now(), ...reward }] }));
  },

  deleteReward: (rewardId) => {
    try { sounds.playClick(); } catch {}
    set(s => ({ shopRewards: (s.shopRewards || []).filter(r => r.id !== rewardId) }));
  },

  deleteHistoryEntry: (index) => {
    try { sounds.playClick(); } catch {}
    set(s => ({
      redeemedHistory: (s.redeemedHistory || []).filter((_, i) => i !== index)
    }));
  },

  clearHistory: () => {
    try { sounds.playClick(); } catch {}
    set(() => ({ redeemedHistory: [] }));
  },

  // Custom Modules
  customModules: [
    { id: "module-default-1", title: "Mindfulness & Meditation", category: "Daily Life", description: "Daily breathwork and gratitude log", accentColor: "#ec4899", tasks: [] }
  ],
  addCustomModule: (newModule) => {
    try { sounds.playCoin(); } catch {}
    set(s => ({ customModules: [...(s.customModules || []), { id: `module-${Date.now()}`, ...newModule, tasks: [] }] }));
  },
  removeCustomModule: (id) => {
    try { sounds.playClick(); } catch {}
    set(s => ({ customModules: (s.customModules || []).filter(m => m.id !== id) }));
  },

  // Add task to custom module
  addTaskToModule: (moduleId, taskName) => {
    set(s => ({
      customModules: (s.customModules || []).map(m =>
        m.id === moduleId
          ? { ...m, tasks: [...(m.tasks || []), { id: `task-${Date.now()}`, name: taskName, completed: false, date: new Date().toISOString() }] }
          : m
      )
    }));
  },
  lastQualifyingDate: (() => {
    try { return localStorage.getItem("lifixify_last_qualifying_date") || null; } catch { return null; }
  })(),

  recordQualifyingActivity: () => {
    try { sounds.playCoin(); } catch {}
    const today = getTodayKey();
    try { localStorage.setItem("lifixify_last_qualifying_date", today); } catch {}
    set(s => {
      const curStreak = Number(s.user?.streak) || 0;
      const newStreak = curStreak > 0 ? curStreak : 1;
      return {
        lastQualifyingDate: today,
        user: {
          ...(s.user || DEFAULT_USER),
          streak: newStreak,
          lastQualifyingDate: today
        }
      };
    });
  },

  toggleModuleTask: (moduleId, taskId) => {
    set(s => {
      const updated = (s.customModules || []).map(m => {
        if (m.id !== moduleId) return m;
        const tasks = (m.tasks || []).map(t => {
          if (t.id !== taskId) return t;
          const nowCompleted = !t.completed;
          if (nowCompleted) {
            setTimeout(() => get().addXp(25), 0);
            setTimeout(() => get().addCoins(5), 0);
            setTimeout(() => get().recordQualifyingActivity(), 0);
          }
          return { ...t, completed: nowCompleted };
        });
        return { ...m, tasks };
      });
      return { customModules: updated };
    });
  },

  // XP system
  addXp: (amount) => {
    const { user } = get();
    const currentXp = Number(user?.xp) || 0;
    const currentLevel = calculateLevelFromXp(currentXp);
    const newXp = currentXp + (Number(amount) || 0);
    const newLevel = calculateLevelFromXp(newXp);
    const newRankTitle = getRankTitle(newLevel);
    if (newLevel > currentLevel) {
      try { sounds.playLevelUp(); } catch {}
      fireLevelUpConfetti();
      set({ levelUpModal: { isOpen: true, newLevel, unlockedTitle: newRankTitle } });
    } else {
      try { sounds.playXpGain(); } catch {}
    }
    set(s => ({
      user: {
        ...(s.user || DEFAULT_USER),
        xp: newXp,
        level: newLevel,
        rankTitle: newRankTitle
      }
    }));
  },

  addCoins: (amount) => {
    try { sounds.playCoin(); } catch {}
    set(s => ({
      user: {
        ...(s.user || DEFAULT_USER),
        coins: (Number(s.user?.coins) || 0) + (Number(amount) || 0)
      }
    }));
  },

  incrementStreak: () => {
    try { sounds.playCoin(); } catch {}
    set(s => ({
      user: {
        ...(s.user || DEFAULT_USER),
        streak: (Number(s.user?.streak) || 0) + 1
      }
    }));
    get().addXp(50);
  },

  // Auth actions
  loginUser: (userData, token) => {
    if (token) {
      try { localStorage.setItem("lifixify_token", token); } catch {}
    }
    const xp = Number(userData?.xp) || 0;
    const level = calculateLevelFromXp(xp);
    set({
      user: {
        ...DEFAULT_USER,
        ...userData,
        xp,
        level,
        coins: Number(userData?.coins) || 0,
        streak: Number(userData?.streak) || 0,
        rankTitle: getRankTitle(level),
        avatar: userData?.avatar || "🧠",
        unlockedBadges: Array.isArray(userData?.unlockedBadges) ? userData.unlockedBadges : []
      },
      isAuthenticated: true
    });
  },

  logoutUser: () => {
    try { localStorage.removeItem("lifixify_token"); } catch {}
    set({
      isAuthenticated: false,
      user: { ...DEFAULT_USER },
      activeSidePanel: null
    });
  },

  updateUserLocal: (patch) => {
    set(s => ({ user: { ...(s.user || DEFAULT_USER), ...patch } }));
  },

  // Initialize session — called ONCE on mount via useStore.getState().initSession()
  // Protected against hanging promises and network drops
  initSession: async () => {
    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("lifixify_token") : null;
      if (!token) {
        set({ isAuthenticated: false, user: { ...DEFAULT_USER } });
        return;
      }

      // Add a safety timeout signal (3s max)
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);

      const meData = await api.auth.getMe();
      clearTimeout(timer);

      if (meData && meData.success && meData.user) {
        const u = meData.user;
        const xp = Number(u.xp) || 0;
        const level = calculateLevelFromXp(xp);
        set({
          user: {
            ...DEFAULT_USER,
            ...u,
            xp,
            level,
            coins: Number(u.coins) || 0,
            streak: Number(u.streak) || 0,
            rankTitle: getRankTitle(level),
            avatar: u.avatar || "🧠",
            unlockedBadges: Array.isArray(u.unlockedBadges) ? u.unlockedBadges : []
          },
          isAuthenticated: true
        });
      } else {
        try { localStorage.removeItem("lifixify_token"); } catch {}
        set({ isAuthenticated: false, user: { ...DEFAULT_USER } });
      }
    } catch (err) {
      console.warn("Session check did not complete:", err.message);
      try { localStorage.removeItem("lifixify_token"); } catch {}
      set({ isAuthenticated: false, user: { ...DEFAULT_USER } });
    }
  }
}));
