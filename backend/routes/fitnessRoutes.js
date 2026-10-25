const express = require('express');
const router = express.Router();
const FitnessLog = require('../models/FitnessLog');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const { awardUserRewards } = require('../utils/gamification');

router.use(verifyToken);

const getDayBounds = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @route   GET /api/fitness
router.get('/', async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    const query = { userId: req.user.id };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const logs = await FitnessLog.find(query).sort({ date: -1 }).limit(parseInt(limit, 10));
    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/fitness/date/:date?
router.get('/date', async (req, res, next) => {
  try {
    const { start, end } = getDayBounds();
    const log = await FitnessLog.findOne({ userId: req.user.id, date: { $gte: start, $lte: end } });
    res.status(200).json({ success: true, log });
  } catch (err) {
    next(err);
  }
});

router.get('/date/:date', async (req, res, next) => {
  try {
    const { start, end } = getDayBounds(req.params.date);
    const log = await FitnessLog.findOne({ userId: req.user.id, date: { $gte: start, $lte: end } });
    res.status(200).json({ success: true, log });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/fitness/log
router.post('/log', async (req, res, next) => {
  try {
    const { date, workouts, nutrition } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    const { start, end } = getDayBounds(targetDate);

    // Normalize workouts to accept exercise, exerciseName, or name from any client payload
    let normalizedWorkouts = undefined;
    if (workouts && Array.isArray(workouts)) {
      normalizedWorkouts = workouts.map(w => {
        const title = (w.exercise || w.exerciseName || w.name || "").trim();
        return {
          exercise: title,
          sets: Math.max(1, Number(w.sets) || 1),
          reps: Math.max(0, Number(w.reps) || 10),
          weight: Math.max(0, Number(w.weight) || 0)
        };
      }).filter(w => w.exercise.length > 0);
    }

    let log = await FitnessLog.findOne({ userId: req.user.id, date: { $gte: start, $lte: end } });
    const isNew = !log;

    if (log) {
      if (normalizedWorkouts !== undefined) log.workouts = normalizedWorkouts;
      if (nutrition) {
        log.nutrition = {
          calories: nutrition.calories ?? log.nutrition.calories,
          protein: nutrition.protein ?? log.nutrition.protein,
          carbs: nutrition.carbs ?? log.nutrition.carbs,
          fats: nutrition.fats ?? log.nutrition.fats,
          waterGlasses: nutrition.waterGlasses ?? log.nutrition.waterGlasses
        };
      }
      await log.save();
    } else {
      log = await FitnessLog.create({
        userId: req.user.id,
        date: targetDate,
        workouts: normalizedWorkouts || [],
        nutrition: nutrition || {}
      });
    }

    let rewards = null;
    if (isNew || (normalizedWorkouts && normalizedWorkouts.length > 0)) {
      const user = await User.findById(req.user.id);
      rewards = await awardUserRewards(user, { xp: 30, coins: 10, context: { fitnessLogged: true } });
    }

    res.status(isNew ? 201 : 200).json({ success: true, message: 'Fitness logged', log, rewards });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
