const mongoose = require('mongoose');

const FinanceLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
      index: true
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense'
      }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'General'
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot exceed 200 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

FinanceLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('FinanceLog', FinanceLogSchema);
