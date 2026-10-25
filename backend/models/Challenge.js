const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  xpReward: {
    type: Number,
    default: 20,
    min: 0
  }
});

const DayDataSchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: [true, 'Day number is required'],
    min: 1
  },
  completedStatus: {
    type: Boolean,
    default: false
  },
  tasks: [TaskSchema]
});

const ChallengeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a challenge title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    totalDays: {
      type: Number,
      required: [true, 'Total days count is required'],
      min: [1, 'Challenge must have at least 1 day'],
      max: [365, 'Challenge cannot exceed 365 days']
    },
    category: {
      type: String,
      enum: ['fitness', 'mindfulness', 'learning', 'productivity', 'finance', 'lifestyle', 'custom'],
      default: 'productivity'
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'abandoned'],
      default: 'active'
    },
    daysData: [DayDataSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Challenge', ChallengeSchema);
