import { create } from "zustand";
import confetti from "canvas-confetti";
import { sounds } from "../utils/soundEffects";
import { api } from "../services/api";

// ─── Utility helpers ────────────────────────────────────────────────────────
export const getRankTitle = (level) => {
  const lvl = Number(level) || 1;
  if (lvl >= 15) return "Transcendent Sovereign";
  if (lvl >= 10) return "Grandmaster Paragon";
  if (lvl >= 7)  return "Master Strategist";
  if (lvl >= 4)  return "Vanguard Champion";
  if (lvl >= 2)  return "Apprentice Builder";
  return "Novice Architect";
};

export const calculateLevelFromXp = (xp) => Math.floor(Math.max(0, Number(xp) || 0) / 500) + 1;

export const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const checkIsStreakActiveToday = (user) => {
  const today = getTodayKey();
  try {
    if (localStorage.getItem("lifixify_last_qualifying_date") === today) return true;
  } catch {}
  if (user?.lastQualifyingDate) {
    const d = typeof user.lastQualifyingDate === "string"
      ? user.lastQualifyingDate.split("T")[0]
      : new Date(user.lastQualifyingDate).toISOString().split("T")[0];
    if (d === today) return true;
  }
  return false;
};

export const fireLevelUpConfetti = () => {
  try {
    const duration = 2500;
    const end = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
    const rnd = (min, max) => Math.random() * (max - min) + min;
    const iv = setInterval(() => {
      const left = end - Date.now();
      if (left <= 0) return clearInterval(iv);
      const n = 50 * (left / duration);
      confetti({ ...defaults, particleCount: n, origin: { x: rnd(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount: n, origin: { x: rnd(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  } catch {}
};

// ─── localStorage helpers ────────────────────────────────────────────────────
const LS = {
  get: (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    } catch {
      return fallback;
    }
  },
  set: (key, value) => {
    try {
      const val = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, val);
    } catch {}
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};

// Pre-render theme initialization
export const getInitialIsDark = () => {
  try {
    const saved = localStorage.getItem("lifixify_theme");
    if (saved === "dark" || saved === "true") return true;
    if (saved === "light" || saved === "false") return false;
  } catch {}
  return false;
};

(() => {
  try {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", getInitialIsDark());
    }
  } catch {}
})();

// Default shop rewards
const DEFAULT_SHOP_REWARDS = [
  { id: 1, title: "1 Hour Gaming Pass",     cost: 75,  category: "Leisure",       icon: "Gamepad2" },
  { id: 2, title: "Cheat Meal Feast",       cost: 200, category: "Food",          icon: "UtensilsCrossed" },
  { id: 3, title: "Movie & Popcorn Night",  cost: 150, category: "Entertainment", icon: "Film" },
  { id: 4, title: "Sleep-In Pass (+1 Hour)",cost: 100, category: "Wellness",      icon: "Moon" }
];

const DEFAULT_CUSTOM_MODULES = [
  { id: "module-default-1", title: "Mindfulness & Meditation", category: "Daily Life",
    description: "Daily breathwork and gratitude log", accentColor: "#ec4899", tasks: [] }
];

export const DEFAULT_USER = {
  _id: "", name: "Player", email: "",
  level: 1, xp: 0, coins: 0, streak: 0,
  rankTitle: "Novice Architect",
  unlockedBadges: [], avatar: "🧠",
  lastQualifyingDate: null
};

// ─── Debounced backend sync ──────────────────────────────────────────────────
let _syncTimer = null;
const scheduleBackendSync = (getState) => {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(async () => {
    try {
      const { user, isDark, isMuted, customModules, shopRewards, redeemedHistory } = getState();
      if (!user?._id) return;
      await api.users.updateProfile({
        xp: user.xp,
        coins: user.coins,
        streak: user.streak,
        level: user.level,
        lastQualifyingDate: user.lastQualifyingDate || null,
        avatar: user.avatar,
        settings: {
          isDark,
          theme: isDark ? "dark" : "light",
          isMuted,
          soundEnabled: !isMuted
        },
        customModules: customModules || [],
        shopRewards: (shopRewards || []).filter(r => typeof r.id === "string" || Number(r.id) > 4),
        redeemedHistory: redeemedHistory || []
      });
    } catch (err) {
      console.debug("Profile sync skipped:", err.message);
    }
  }, 1200);
};

// ─── Persist client-only state to localStorage ───────────────────────────────
const persistLocal = (state) => {
  try {
    localStorage.setItem("lifixify_theme", state.isDark ? "dark" : "light");
    LS.set("lifixify_muted", state.isMuted);
    LS.set("lifixify_custom_modules", state.customModules);
    LS.set("lifixify_shop_rewards", state.shopRewards);
    LS.set("lifixify_redeemed_history", state.redeemedHistory);
    if (state.user) {
      LS.set("lifixify_cached_user", state.user);
      if (state.user.lastQualifyingDate) {
        localStorage.setItem("lifixify_last_qualifying_date", state.user.lastQualifyingDate);
      }
    }
  } catch {}
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStore = create((set, get) => ({

  // ── Auth & Profile ──
  user: LS.get("lifixify_cached_user", { ...DEFAULT_USER }),
  isAuthenticated: !!LS.get("lifixify_token", null),

  // ── Theme & Settings ──
  isDark: getInitialIsDark(),
  theme: getInitialIsDark() ? "dark" : "light",
  toggleTheme: () => set(s => {
    const next = !s.isDark;
    try {
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next);
      }
      localStorage.setItem("lifixify_theme", next ? "dark" : "light");
    } catch {}
    scheduleBackendSync(get);
    return { isDark: next, theme: next ? "dark" : "light" };
  }),

  // ── Audio ──
  isMuted: LS.get("lifixify_muted", false),
  soundEnabled: !LS.get("lifixify_muted", false),
  toggleSound: () => {
    try {
      const newMute = sounds.toggleMute();
      LS.set("lifixify_muted", newMute);
      set({ isMuted: newMute, soundEnabled: !newMute });
      scheduleBackendSync(get);
    } catch {
      set(s => {
        const newMute = !s.isMuted;
        LS.set("lifixify_muted", newMute);
        scheduleBackendSync(get);
        return { isMuted: newMute, soundEnabled: !newMute };
      });
    }
  },

  // ── Navigation ──
  activeSidePanel: null,
  activeModuleFilter: "All Modules",
  setActiveSidePanel: (panel) => set({ activeSidePanel: panel }),
  setActiveModuleFilter: (filter) => set({ activeModuleFilter: filter, activeSidePanel: null }),

  // ── Level-up modal ──
  levelUpModal: { isOpen: false, newLevel: 1, unlockedTitle: "" },
  closeLevelUpModal: () => set(s => ({ levelUpModal: { ...s.levelUpModal, isOpen: false } })),

  // ── AI Drawer ──
  isAiDrawerOpen: false,
  toggleAiDrawer: () => set(s => ({ isAiDrawerOpen: !s.isAiDrawerOpen })),

  // ── Shop Rewards ──
  shopRewards: (() => {
    const saved = LS.get("lifixify_shop_rewards", null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return [...DEFAULT_SHOP_REWARDS];
  })(),

  redeemedHistory: LS.get("lifixify_redeemed_history", []),

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
      category: reward.category || "General",
      redeemedAt: new Date().toISOString()
    };
    set(s => {
      const next = {
        user: { ...s.user, coins: Math.max(0, userCoins - reward.cost) },
        redeemedHistory: [historyEntry, ...(s.redeemedHistory || [])]
      };
      persistLocal({ ...s, ...next });
      scheduleBackendSync(get);
      return next;
    });
    return true;
  },

  addCustomReward: (reward) => {
    try { sounds.playCoin(); } catch {}
    set(s => {
      const next = { shopRewards: [...(s.shopRewards || []), { id: Date.now(), ...reward }] };
      persistLocal({ ...s, ...next });
      scheduleBackendSync(get);
      return next;
    });
  },

  deleteReward: (rewardId) => {
    try { sounds.playClick(); } catch {}
    set(s => {
      const next = { shopRewards: (s.shopRewards || []).filter(r => r.id !== rewardId) };
      persistLocal({ ...s, ...next });
      scheduleBackendSync(get);
      return next;
    });
  },

  deleteHistoryEntry: (index) => {
    try { sounds.playClick(); } catch {}
    set(s => {
      const next = { redeemedHistory: (s.redeemedHistory || []).filter((_, i) => i !== index) };
      persistLocal({ ...s, ...next });
      scheduleBackendSync(get);
      return next;
    });
  },

  clearHistory: () => {
    try { sounds.playClick(); } catch {}
    set(s => {
      const next = { redeemedHistory: [] };
      persistLocal({ ...s, ...next });
      scheduleBackendSync(get);
      return next;
    });
  },

  // ── Custom Modules ──
  customModules: (() => {
    const saved = LS.get("lifixify_custom_modules", null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return [...DEFAULT_CUSTOM_MODULES];
  })(),

  addCustomModule: (newModule) => {
    try { sounds.playCoin(); } catch {}
    set(s => {
      const next = { customModules: [...(s.customModules || []), { id: `module-${Date.now()}`, ...newModule, tasks: [] }] };
      persistLocal({ ...s, ...next });
      scheduleBackendSync(get);
      return next;
    });
  },

  removeCustomModule: (id) => {
    try { sounds.playClick(); } catch {}
    set(s => {
      const next = { customModules: (s.customModules || []).filter(m => m.id !== id) };
      persistLocal({ ...s, ...next });
      scheduleBackendSync(get);
      return next;
    });
  },

  addTaskToModule: (moduleId, taskName) => {
    set(s => {
      const next = {
        customModules: (s.customModules || []).map(m =>
          m.id === moduleId
            ? { ...m, tasks: [...(m.tasks || []), { id: `task-${Date.now()}`, name: taskName, completed: false, date: new Date().toISOString() }] }
            : m
        )
      };
      persistLocal({ ...s, ...next });
      scheduleBackendSync(get);
      return next;
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
      const next = { customModules: updated };
      persistLocal({ ...s, ...next });
      scheduleBackendSync(get);
      return next;
    });
  },

  // ── Multi-Day Challenges ──
  challenges: LS.get("lifixify_challenges", []),
  setChallenges: (challenges) => {
    LS.set("lifixify_challenges", challenges);
    set({ challenges });
  },

  // ── Streak ──
  lastQualifyingDate: LS.get("lifixify_last_qualifying_date", null),

  recordQualifyingActivity: () => {
    try { sounds.playCoin(); } catch {}
    const today = getTodayKey();
    localStorage.setItem("lifixify_last_qualifying_date", today);
    set(s => {
      const curStreak = Number(s.user?.streak) || 0;
      const newStreak = curStreak > 0 ? curStreak : 1;
      const next = {
        lastQualifyingDate: today,
        user: { ...(s.user || DEFAULT_USER), streak: newStreak, lastQualifyingDate: today }
      };
      persistLocal({ ...s, ...next });
      scheduleBackendSync(get);
      return next;
    });
  },

  // ── XP & Coins ──
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
    set(s => {
      const next = {
        user: { ...(s.user || DEFAULT_USER), xp: newXp, level: newLevel, rankTitle: newRankTitle }
      };
      persistLocal({ ...s, ...next });
      scheduleBackendSync(get);
      return next;
    });
  },

  addCoins: (amount) => {
    try { sounds.playCoin(); } catch {}
    set(s => {
      const next = {
        user: { ...(s.user || DEFAULT_USER), coins: (Number(s.user?.coins) || 0) + (Number(amount) || 0) }
      };
      persistLocal({ ...s, ...next });
      scheduleBackendSync(get);
      return next;
    });
  },

  incrementStreak: () => {
    try { sounds.playCoin(); } catch {}
    set(s => {
      const next = { user: { ...(s.user || DEFAULT_USER), streak: (Number(s.user?.streak) || 0) + 1 } };
      persistLocal({ ...s, ...next });
      scheduleBackendSync(get);
      return next;
    });
    get().addXp(50);
  },

  // ── Auth actions ──
  loginUser: (userData, token) => {
    if (token) localStorage.setItem("lifixify_token", token);
    const xp = Number(userData?.xp) || 0;
    const level = calculateLevelFromXp(xp);

    const dbShopRewards   = Array.isArray(userData?.shopRewards)   && userData.shopRewards.length   > 0 ? userData.shopRewards   : null;
    const dbCustomModules = Array.isArray(userData?.customModules) && userData.customModules.length > 0 ? userData.customModules : null;
    const dbHistory       = Array.isArray(userData?.redeemedHistory)                                    ? userData.redeemedHistory : null;
    const dbSettings      = userData?.settings || {};

    const shopRewards    = dbShopRewards   ?? LS.get("lifixify_shop_rewards",     [...DEFAULT_SHOP_REWARDS]);
    const customModules  = dbCustomModules ?? LS.get("lifixify_custom_modules",   [...DEFAULT_CUSTOM_MODULES]);
    const redeemedHistory= dbHistory       ?? LS.get("lifixify_redeemed_history", []);

    // Theme resolution: check DB settings first, then local storage
    let isDark = getInitialIsDark();
    if (dbSettings.isDark !== undefined) {
      isDark = Boolean(dbSettings.isDark);
    } else if (dbSettings.theme !== undefined) {
      isDark = dbSettings.theme === "dark";
    }

    const isMuted = dbSettings.isMuted !== undefined ? Boolean(dbSettings.isMuted) : LS.get("lifixify_muted", false);

    try {
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", isDark);
      }
    } catch {}

    const updatedUser = {
      ...DEFAULT_USER,
      ...userData,
      xp,
      level,
      coins:  Number(userData?.coins)  || 0,
      streak: Number(userData?.streak) || 0,
      rankTitle: getRankTitle(level),
      avatar: userData?.avatar || "🧠",
      unlockedBadges: Array.isArray(userData?.unlockedBadges) ? userData.unlockedBadges : []
    };

    persistLocal({
      isDark,
      isMuted,
      shopRewards,
      customModules,
      redeemedHistory,
      user: updatedUser
    });

    set({
      user: updatedUser,
      isAuthenticated: true,
      isDark,
      theme: isDark ? "dark" : "light",
      isMuted,
      soundEnabled: !isMuted,
      shopRewards,
      customModules,
      redeemedHistory,
      lastQualifyingDate: userData?.lastQualifyingDate || LS.get("lifixify_last_qualifying_date", null)
    });
  },

  logoutUser: () => {
    localStorage.removeItem("lifixify_token");
    localStorage.removeItem("lifixify_shop_rewards");
    localStorage.removeItem("lifixify_redeemed_history");
    localStorage.removeItem("lifixify_custom_modules");
    localStorage.removeItem("lifixify_cached_user");
    localStorage.removeItem("lifixify_last_qualifying_date");
    set({
      isAuthenticated: false,
      user: { ...DEFAULT_USER },
      activeSidePanel: null,
      shopRewards: [...DEFAULT_SHOP_REWARDS],
      customModules: [...DEFAULT_CUSTOM_MODULES],
      redeemedHistory: []
    });
  },

  updateUserLocal: (patch) => {
    set(s => {
      const nextUser = { ...(s.user || DEFAULT_USER), ...patch };
      persistLocal({ ...s, user: nextUser });
      return { user: nextUser };
    });
    scheduleBackendSync(get);
  },

  // ── Session init ── called on mount in App.jsx
  initSession: async () => {
    try {
      const token = localStorage.getItem("lifixify_token");
      if (!token) {
        set({ isAuthenticated: false, user: { ...DEFAULT_USER } });
        return;
      }

      // Fast race against network timeout
      const meData = await Promise.race([
        api.auth.getMe(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 6000))
      ]);

      if (meData?.success && meData.user) {
        get().loginUser(meData.user, token);
      } else {
        localStorage.removeItem("lifixify_token");
        set({ isAuthenticated: false, user: { ...DEFAULT_USER } });
      }
    } catch (err) {
      console.warn("Session check failed, checking offline state:", err.message);
      const token = localStorage.getItem("lifixify_token");
      // If token is invalid (401), remove token
      if (err?.status === 401) {
        localStorage.removeItem("lifixify_token");
        set({ isAuthenticated: false, user: { ...DEFAULT_USER } });
      } else if (token) {
        // Offline / network failure: keep user authenticated using cached local data
        const cachedUser = LS.get("lifixify_cached_user", null);
        if (cachedUser && cachedUser._id) {
          get().loginUser(cachedUser, token);
        } else {
          set({ isAuthenticated: true });
        }
      }
    }
  }
}));
