const mongoose = require('mongoose');

const WorkoutItemSchema = new mongoose.Schema({
  exercise: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true
  },
  sets: {
    type: Number,
    default: 1,
    min: 1
  },
  reps: {
    type: Number,
    default: 10,
    min: 0
  },
  weight: {
    type: Number,
    default: 0,
    min: 0
  }
});

const NutritionSchema = new mongoose.Schema({
  calories: {
    type: Number,
    default: 0,
    min: 0
  },
  protein: {
    type: Number,
    default: 0,
    min: 0
  },
  carbs: {
    type: Number,
    default: 0,
    min: 0
  },
  fats: {
    type: Number,
    default: 0,
    min: 0
  },
  waterGlasses: {
    type: Number,
    default: 0,
    min: 0
  }
});

const FitnessLogSchema = new mongoose.Schema(
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
    workouts: [WorkoutItemSchema],
    nutrition: {
      type: NutritionSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
);

FitnessLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('FitnessLog', FitnessLogSchema);
