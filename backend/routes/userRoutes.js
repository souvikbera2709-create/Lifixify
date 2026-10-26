const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

// @route   GET /api/users/profile
// Returns full profile including settings, customModules, shopRewards, redeemedHistory
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/users/profile
// Accepts partial patch of any user fields (xp, coins, streak, settings, customModules, shopRewards, redeemedHistory, avatar…)
router.put('/profile', async (req, res, next) => {
  try {
    const ALLOWED_FIELDS = [
      'name', 'avatar',
      'xp', 'coins', 'streak', 'level', 'rankTitle',
      'lastQualifyingDate',
      'settings',
      'customModules',
      'shopRewards',
      'redeemedHistory',
      'unlockedBadges'
    ];

    const patch = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        patch[field] = req.body[field];
      }
    }

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: patch },
      { new: true, runValidators: false, select: '-password' }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
