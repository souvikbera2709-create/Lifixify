const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const FinanceLog = require('../models/FinanceLog');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const { awardUserRewards } = require('../utils/gamification');

router.use(verifyToken);

// @route   GET /api/finance
router.get('/', async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, limit = 50 } = req.query;
    const query = { userId: req.user.id };
    if (type) query.type = type;
    if (category) query.category = new RegExp(category, 'i');
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const logs = await FinanceLog.find(query).sort({ date: -1 }).limit(parseInt(limit, 10));
    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/finance
router.post('/', async (req, res, next) => {
  try {
    const { type, category, amount, note, date } = req.body;
    if (!type || !category || amount === undefined) {
      return res.status(400).json({ success: false, message: 'type, category, and amount are required' });
    }

    const log = await FinanceLog.create({
      userId: req.user.id,
      date: date ? new Date(date) : new Date(),
      type,
      category: category.trim(),
      amount: Number(amount),
      note: note ? note.trim() : ''
    });

    const user = await User.findById(req.user.id);
    const rewards = await awardUserRewards(user, { xp: 15, coins: 3, context: { financeLogged: true } });

    res.status(201).json({ success: true, log, rewards });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/finance/summary
router.get('/summary', async (req, res, next) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const totals = await FinanceLog.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    totals.forEach((item) => {
      if (item._id === 'income') totalIncome = item.total;
      if (item._id === 'expense') totalExpenses = item.total;
    });

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

    const categoryBreakdown = await FinanceLog.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: { type: '$type', category: '$category' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate: Number(savingsRate),
        categoryBreakdown: categoryBreakdown.map((item) => ({
          type: item._id.type,
          category: item._id.category,
          total: item.total,
          count: item.count
        }))
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/finance/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const log = await FinanceLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
