const mongoose = require('mongoose');

const CustomExerciseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true
    },
    category: {
      type: String,
      default: 'Strength',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

CustomExerciseSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('CustomExercise', CustomExerciseSchema);
