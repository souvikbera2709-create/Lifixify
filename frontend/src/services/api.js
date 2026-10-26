/**
 * LiFixify Backend API Client
 * Connects frontend modules to Express/MongoDB/Gemini backend
 */

// ── API Base URL Resolution ──────────────────────────────────────────
// Handles any malformed env variables (e.g. markdown links, extra brackets, quotes)
const _PROTO = 'https';
const _HOST = 'lifixify.onrender.com';
const RENDER_BACKEND = `${_PROTO}://${_HOST}`;

function sanitizeUrl(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let url = raw.trim();
  // If wrapped in markdown link syntax [text](url) or [url]
  const mdMatch = url.match(/\((https?:\/\/[^)]+)\)/) || url.match(/\[(https?:\/\/[^\]]+)\]/);
  if (mdMatch) {
    url = mdMatch[1];
  }
  // Strip any leading/trailing brackets, parentheses, or quotes
  url = url.replace(/^[[\("'\s]+|[]\)"'\s]+$/g, '').trim();
  // Strip trailing slashes
  url = url.replace(/\/+$/, '');
  return url;
}

function resolveBaseUrl() {
  const envUrl = sanitizeUrl(import.meta.env.VITE_API_BASE_URL);

  // 1. Clean env var always wins if it is a valid HTTP(S) URL
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    return envUrl;
  }

  // 2. Auto-detect production: if on Vercel or any live host, point to Render backend
  if (typeof window !== 'undefined') {
    const h = window.location.hostname;
    if (h.endsWith('.vercel.app') || h === 'lifixify.vercel.app' || (h !== 'localhost' && h !== '127.0.0.1')) {
      return RENDER_BACKEND;
    }
  }

  // 3. Local development fallback
  return 'http://localhost:5001';
}

const rawBaseUrl = resolveBaseUrl();

// Normalise: strip trailing slashes, ensure path ends with /api exactly once
const _clean = rawBaseUrl.replace(/\/+$/, '');
const API_BASE = _clean.endsWith('/api') ? _clean : `${_clean}/api`;

const getHeaders = () => {
  const token = localStorage.getItem('lifixify_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  let data = {};
  try {
    data = await res.json();
  } catch {
    // Response had no JSON body (e.g. 204 No Content)
  }
  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

export const api = {
  // Auth
  auth: {
    register: async (name, email, password) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password })
      });
      const data = await handleResponse(res);
      if (data.token) localStorage.setItem('lifixify_token', data.token);
      return data;
    },
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await handleResponse(res);
      if (data.token) localStorage.setItem('lifixify_token', data.token);
      return data;
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      return handleResponse(res);
    },
    getLeaderboard: async () => {
      const res = await fetch(`${API_BASE}/auth/leaderboard`);
      return handleResponse(res);
    }
  },

  // Challenges
  challenges: {
    getAll: async (category, status) => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      const res = await fetch(`${API_BASE}/challenges?${params.toString()}`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      return handleResponse(res);
    },
    create: async (challengeData) => {
      const res = await fetch(`${API_BASE}/challenges`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(challengeData)
      });
      return handleResponse(res);
    },
    toggleTask: async (challengeId, dayNumber, taskId, completed) => {
      const res = await fetch(
        `${API_BASE}/challenges/${challengeId}/day/${dayNumber}/task/${taskId}`,
        {
          method: 'PATCH',
          headers: getHeaders(),
          credentials: 'include',
          body: JSON.stringify({ completed })
        }
      );
      return handleResponse(res);
    },
    planTask: async (challengeId, dayNumber, taskName, xpReward = 25) => {
      const res = await fetch(
        `${API_BASE}/challenges/${challengeId}/day/${dayNumber}/task`,
        {
          method: 'POST',
          headers: getHeaders(),
          credentials: 'include',
          body: JSON.stringify({ taskName, xpReward })
        }
      );
      return handleResponse(res);
    },
    claimMilestone: async (challengeId) => {
      const res = await fetch(`${API_BASE}/challenges/${challengeId}/claim-reward`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include'
      });
      return handleResponse(res);
    },
    delete: async (challengeId) => {
      const res = await fetch(`${API_BASE}/challenges/${challengeId}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });
      return handleResponse(res);
    },
    removeTask: async (challengeId, dayNumber, taskId) => {
      const res = await fetch(
        `${API_BASE}/challenges/${challengeId}/day/${dayNumber}/task/${taskId}`,
        {
          method: 'DELETE',
          headers: getHeaders(),
          credentials: 'include'
        }
      );
      return handleResponse(res);
    }
  },

  // Fitness
  fitness: {
    getLogs: async (limit = 30) => {
      const res = await fetch(`${API_BASE}/fitness?limit=${limit}`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      return handleResponse(res);
    },
    getToday: async () => {
      const res = await fetch(`${API_BASE}/fitness/date`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      return handleResponse(res);
    },
    logDaily: async (payload) => {
      const res = await fetch(`${API_BASE}/fitness/log`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      return handleResponse(res);
    },
    logWorkout: async (payload) => {
      const res = await fetch(`${API_BASE}/fitness/log`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      return handleResponse(res);
    },
    getCustomExercises: async () => {
      const res = await fetch(`${API_BASE}/fitness/exercises`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      return handleResponse(res);
    },
    addCustomExercise: async (name, category = 'Strength') => {
      const res = await fetch(`${API_BASE}/fitness/exercises`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ name, category })
      });
      return handleResponse(res);
    },
    deleteCustomExercise: async (id) => {
      const res = await fetch(`${API_BASE}/fitness/exercises/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });
      return handleResponse(res);
    }
  },

  // Finance
  finance: {
    getLogs: async (limit = 50) => {
      const res = await fetch(`${API_BASE}/finance?limit=${limit}`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      return handleResponse(res);
    },
    create: async (transaction) => {
      const res = await fetch(`${API_BASE}/finance`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(transaction)
      });
      return handleResponse(res);
    },
    getSummary: async () => {
      const res = await fetch(`${API_BASE}/finance/summary`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/finance/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });
      return handleResponse(res);
    }
  },

  // Study
  study: {
    getLogs: async (limit = 30) => {
      const res = await fetch(`${API_BASE}/study?limit=${limit}`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      return handleResponse(res);
    },
    logSession: async (session) => {
      const res = await fetch(`${API_BASE}/study`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(session)
      });
      return handleResponse(res);
    },
    deleteLog: async (id) => {
      const res = await fetch(`${API_BASE}/study/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });
      return handleResponse(res);
    },
    getStats: async () => {
      const res = await fetch(`${API_BASE}/study/stats`, {
        headers: getHeaders(),
        credentials: 'include'
      });
      return handleResponse(res);
    }
  },

  // AI Life Coach
  ai: {
    askCoach: async (message) => {
      const res = await fetch(`${API_BASE}/ai/coach`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ message })
      });
      return handleResponse(res);
    },
    generateChallenge: async (topic, totalDays = 7, category = 'productivity') => {
      const res = await fetch(`${API_BASE}/ai/generate-challenge`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ topic, totalDays, category })
      });
      return handleResponse(res);
    }
  }
};
