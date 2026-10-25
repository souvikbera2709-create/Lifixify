const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const StudyLog = require('../models/StudyLog');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest'
];

const callGemini = async (prompt, systemInstruction = '', jsonMode = false) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const contents = [
        {
          role: 'user',
          parts: [{ text: systemInstruction ? `${systemInstruction}\n\nUser Input:\n${prompt}` : prompt }]
        }
      ];

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: jsonMode ? 0.2 : 0.7, maxOutputTokens: 1024 }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) return candidate;
      } else {
        const errData = await res.json().catch(() => ({}));
        lastError = new Error(errData.error?.message || `HTTP ${res.status}`);
      }
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('Failed to generate from Gemini');
};

// @route   POST /api/ai/coach
router.post('/coach', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'message is required' });

    const user = req.user;
    const activeChallenges = await Challenge.find({ userId: user._id, status: 'active' }).select('title category').limit(3);
    const recentStudy = await StudyLog.findOne({ userId: user._id }).sort({ completedAt: -1 });

    const systemPrompt = `You are Lumina, the AI Life Coach in LiFixify — a gamified productivity platform.
Motivating, empathetic, concise RPG mentor. Always give 1 actionable micro-quest. Under 250 words.
Hero Stats: Name: ${user.name}, Level: ${user.level}, XP: ${user.xp}, Streak: ${user.streak} days.
Active Challenges: ${activeChallenges.map((c) => c.title).join(', ') || 'None'}.
Recent Study: ${recentStudy ? `${recentStudy.subject} (${recentStudy.durationMinutes}m)` : 'None'}.`;

    const reply = await callGemini(message, systemPrompt, false);
    res.status(200).json({ success: true, coach: 'Lumina', reply });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/ai/generate-challenge
router.post('/generate-challenge', async (req, res, next) => {
  try {
    const { topic, totalDays = 7, category = 'productivity' } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: 'topic is required' });

    const daysCount = Math.min(Math.max(1, parseInt(totalDays, 10)), 30);
    const prompt = `Generate a structured ${daysCount}-day challenge for "${topic}".
Return ONLY a raw JSON string matching:
{
  "title": "Title",
  "description": "Short description",
  "category": "${category}",
  "totalDays": ${daysCount},
  "daysData": [
    {
      "dayNumber": 1,
      "completedStatus": false,
      "tasks": [
        { "taskName": "Task 1", "completed": false, "xpReward": 25 },
        { "taskName": "Task 2", "completed": false, "xpReward": 20 }
      ]
    }
  ]
}`;

    const raw = await callGemini(prompt, '', true);
    const cleaned = raw.replace(/^```json/gim, '').replace(/^```/gim, '').trim();
    const plan = JSON.parse(cleaned);

    res.status(200).json({ success: true, plan });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
