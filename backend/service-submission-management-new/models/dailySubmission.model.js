const mongoose = require('mongoose');

const dailySubmissionSchema = new mongoose.Schema(
  {
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DailyChallenge',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    htmlCode: {
      type: String,
      required: true,
    },
    cssCode: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const DailySubmission = mongoose.model('DailySubmission', dailySubmissionSchema);

module.exports = DailySubmission;