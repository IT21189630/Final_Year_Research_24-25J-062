const mongoose = require('mongoose');

const dailySubmissionSchema = new mongoose.Schema({
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailyChallenge',
    required: true
  },
  htmlCode: {
    type: String,
    required: true
  },
  cssCode: {
    type: String,
    required: true
  },
  outputImage: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DailySubmission', dailySubmissionSchema);