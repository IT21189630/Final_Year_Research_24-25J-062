const mongoose = require('mongoose');

const dailyChallengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    referenceImage: {
      type: String, // Path to the reference image
      required: true,
    },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Admin',
    //   required: true,
    // },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const DailyChallenge = mongoose.model('DailyChallenge', dailyChallengeSchema);

module.exports = DailyChallenge;