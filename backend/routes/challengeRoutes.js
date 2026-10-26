const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const { awardUserRewards } = require('../utils/gamification');

router.use(verifyToken);

// @route   GET /api/challenges
router.get('/', async (req, res, next) => {
  try {
    const { category, status } = req.query;
    const query = { userId: req.user.id };
    if (category) query.category = category;
    if (status) query.status = status;

    const challenges = await Challenge.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: challenges.length, challenges });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/challenges
router.post('/', async (req, res, next) => {
  try {
    const { title, description, totalDays, category, daysData } = req.body;
    if (!title || !totalDays) {
      return res.status(400).json({ success: false, message: 'Please provide title and totalDays' });
    }

    let formattedDays = daysData;
    if (!formattedDays || !Array.isArray(formattedDays) || formattedDays.length === 0) {
      formattedDays = [];
      const numDays = Math.min(Math.max(1, parseInt(totalDays, 10)), 365);
      for (let day = 1; day <= numDays; day++) {
        formattedDays.push({
          dayNumber: day,
          completedStatus: false,
          tasks: [
            { taskName: `Day ${day} Primary Goal`, completed: false, xpReward: 25 },
            { taskName: `Day ${day} Habit Check-in`, completed: false, xpReward: 15 }
          ]
        });
      }
    }

    const challenge = await Challenge.create({
      userId: req.user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      totalDays: Number(totalDays),
      category: category || 'productivity',
      daysData: formattedDays
    });

    res.status(201).json({ success: true, challenge });
  } catch (err) {
    next(err);
  }
});

// @route   PATCH /api/challenges/:id/day/:dayNumber/task/:taskId
router.patch('/:id/day/:dayNumber/task/:taskId', async (req, res, next) => {
  try {
    const { id, dayNumber, taskId } = req.params;
    const { completed } = req.body;

    const challenge = await Challenge.findOne({ _id: id, userId: req.user.id });
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const day = challenge.daysData.find((d) => d.dayNumber === parseInt(dayNumber, 10));
    if (!day) {
      return res.status(404).json({ success: false, message: `Day ${dayNumber} not found` });
    }

    const task = day.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const prevStatus = task.completed;
    task.completed = completed;

    let rewards = null;
    if (!prevStatus && completed) {
      const user = await User.findById(req.user.id);
      rewards = await awardUserRewards(user, {
        xp: task.xpReward || 20,
        coins: 5,
        context: { taskCompleted: true }
      });
    }

    day.completedStatus = day.tasks.every((t) => t.completed);
    if (challenge.daysData.every((d) => d.completedStatus)) {
      challenge.status = 'completed';
    }

    await challenge.save();

    res.status(200).json({
      success: true,
      message: completed ? 'Task completed! XP awarded' : 'Task updated',
      challenge,
      updatedTask: task,
      rewards
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/challenges/:id/day/:dayNumber/task
// Advance planning: Add a planned task to any future or current day
router.post('/:id/day/:dayNumber/task', async (req, res, next) => {
  try {
    const { id, dayNumber } = req.params;
    const { taskName, xpReward = 25 } = req.body;

    if (!taskName || !taskName.trim()) {
      return res.status(400).json({ success: false, message: 'taskName is required' });
    }

    const challenge = await Challenge.findOne({ _id: id, userId: req.user.id });
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    let day = challenge.daysData.find((d) => d.dayNumber === parseInt(dayNumber, 10));
    if (!day) {
      // If day doesn't exist yet, create it up to totalDays
      const dayNum = parseInt(dayNumber, 10);
      if (dayNum > challenge.totalDays) {
        return res.status(400).json({ success: false, message: `Day cannot exceed total days (${challenge.totalDays})` });
      }
      day = { dayNumber: dayNum, completedStatus: false, tasks: [] };
      challenge.daysData.push(day);
    }

    const newTask = {
      taskName: taskName.trim(),
      completed: false,
      xpReward: Number(xpReward) || 25
    };

    day.tasks.push(newTask);
    day.completedStatus = false;
    challenge.status = 'active';

    await challenge.save();

    res.status(201).json({
      success: true,
      message: `Task planned for Day ${dayNumber}`,
      challenge,
      task: day.tasks[day.tasks.length - 1]
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/challenges/:id/claim-reward
router.post('/:id/claim-reward', async (req, res, next) => {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.id, userId: req.user.id });
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const allDaysCompleted = challenge.daysData.every((d) => d.completedStatus);
    if (!allDaysCompleted) {
      return res.status(400).json({ success: false, message: 'All days must be completed to claim the reward' });
    }

    const user = await User.findById(req.user.id);
    const rewards = await awardUserRewards(user, {
      xp: 250,
      coins: 100,
      context: { challengeCompleted: true }
    });

    challenge.status = 'completed';
    await challenge.save();

    res.status(200).json({
      success: true,
      message: '🎉 Grand Challenge Completed! Claimed +250 XP and +100 Coins!',
      rewards
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/challenges/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const challenge = await Challenge.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    res.status(200).json({ success: true, message: 'Challenge removed' });
  } catch (err) {
    next(err);
  }
});


// @route   DELETE /api/challenges/:id/day/:dayNumber/task/:taskId
// Remove an individual quest from a specific day
router.delete('/:id/day/:dayNumber/task/:taskId', async (req, res, next) => {
  try {
    const { id, dayNumber, taskId } = req.params;

    const challenge = await Challenge.findOne({ _id: id, userId: req.user.id });
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const day = challenge.daysData.find((d) => d.dayNumber === parseInt(dayNumber, 10));
    if (!day) {
      return res.status(404).json({ success: false, message: `Day ${dayNumber} not found` });
    }

    const taskIndex = day.tasks.findIndex((t) => t._id.toString() === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    day.tasks.splice(taskIndex, 1);
    // Recalculate day completion
    day.completedStatus = day.tasks.length > 0 && day.tasks.every((t) => t.completed);
    // Recalculate challenge completion
    if (challenge.daysData.every((d) => d.completedStatus)) {
      challenge.status = 'completed';
    } else {
      challenge.status = 'active';
    }

    await challenge.save();

    res.status(200).json({ success: true, message: 'Quest removed', challenge });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
