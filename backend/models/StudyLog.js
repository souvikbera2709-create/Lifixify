const mongoose = require('mongoose');

const StudyLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [100, 'Subject cannot exceed 100 characters']
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Study duration must be at least 1 minute']
    },
    xpEarned: {
      type: Number,
      default: 0
    },
    coinsEarned: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
      default: ''
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

StudyLogSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model('StudyLog', StudyLogSchema);
