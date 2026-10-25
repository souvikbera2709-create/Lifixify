const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const StudyLog = require('../models/StudyLog');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const { awardUserRewards } = require('../utils/gamification');

router.use(verifyToken);

// @route   GET /api/study
router.get('/', async (req, res, next) => {
  try {
    const { subject, limit = 50 } = req.query;
    const query = { userId: req.user.id };
    if (subject) query.subject = new RegExp(subject, 'i');

    const logs = await StudyLog.find(query).sort({ completedAt: -1 }).limit(parseInt(limit, 10));
    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/study
router.post('/', async (req, res, next) => {
  try {
    const { subject, durationMinutes, notes, completedAt } = req.body;
    if (!subject || !durationMinutes) {
      return res.status(400).json({ success: false, message: 'subject and durationMinutes required' });
    }

    const duration = Number(durationMinutes);
    const xpReward = Math.round(duration * 1.0);
    const coinsReward = Math.max(1, Math.floor(duration / 10));

    const log = await StudyLog.create({
      userId: req.user.id,
      subject: subject.trim(),
      durationMinutes: duration,
      xpEarned: xpReward,
      coinsEarned: coinsReward,
      notes: notes ? notes.trim() : '',
      completedAt: completedAt ? new Date(completedAt) : new Date()
    });

    const totalMinutesAgg = await StudyLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: null, totalMinutes: { $sum: '$durationMinutes' } } }
    ]);
    const totalStudyMinutes = totalMinutesAgg[0]?.totalMinutes || duration;

    const user = await User.findById(req.user.id);
    const rewards = await awardUserRewards(user, {
      xp: xpReward,
      coins: coinsReward,
      context: { totalStudyMinutes }
    });

    res.status(201).json({ success: true, log, rewards });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/study/stats
router.get('/stats', async (req, res, next) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const subjectStats = await StudyLog.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$subject',
          totalMinutes: { $sum: '$durationMinutes' },
          sessionsCount: { $sum: 1 },
          totalXp: { $sum: '$xpEarned' }
        }
      },
      { $sort: { totalMinutes: -1 } }
    ]);

    const totalMinutes = subjectStats.reduce((acc, curr) => acc + curr.totalMinutes, 0);

    res.status(200).json({
      success: true,
      stats: {
        totalMinutes,
        totalHours: (totalMinutes / 60).toFixed(1),
        totalSessions: subjectStats.reduce((acc, curr) => acc + curr.sessionsCount, 0),
        subjectStats
      }
    });
  } catch (err) {
    next(err);
  }
});


// @route   DELETE /api/study/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const log = await StudyLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!log) {
      return res.status(404).json({ success: false, message: "Study log not found or unauthorized" });
    }
    res.status(200).json({ success: true, message: "Study session log deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
