const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

// Token helper
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      level: user.level,
      xp: user.xp,
      coins: user.coins,
      streak: user.streak,
      unlockedBadges: user.unlockedBadges,
      customSections: user.customSections,
      createdAt: user.createdAt
    }
  });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      customSections: [
        {
          title: 'Daily Morning Routine',
          type: 'checklist',
          color: '#6366f1',
          items: [
            { text: 'Drink 500ml water', completed: false },
            { text: '10 min morning stretch', completed: false }
          ]
        }
      ]
    });

    sendTokenResponse(user, 201, res, 'User registered successfully');
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Daily streak check
    const now = new Date();
    if (user.lastActiveDate) {
      const diffHours = (now - new Date(user.lastActiveDate)) / (1000 * 60 * 60);
      if (diffHours >= 20 && diffHours <= 48) {
        user.streak += 1;
      } else if (diffHours > 48) {
        user.streak = 1;
      }
    } else {
      user.streak = 1;
    }
    user.lastActiveDate = now;
    await user.save();

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/logout
router.post('/logout', verifyToken, (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @route   GET /api/auth/me
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/auth/leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const topUsers = await User.find({
      name: { $not: /^Hero/i },
      email: { $not: /@lifixify\.io$/i }
    })
      .select('name level xp streak coins unlockedBadges avatar email')
      .sort({ level: -1, xp: -1, streak: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      leaderboard: topUsers
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
