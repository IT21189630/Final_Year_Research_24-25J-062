// models/DailySubmission.js
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
  jsCode: {
    type: String,
    default: ''
  },
  outputImage: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  visualScore: {
    type: Number,
    required: true
  },
  jsScore: {
    type: Number,
    default: 0
  },
  relevanceScore: {
    type: Number,
    default: 0
  },
  jsEvaluation: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DailySubmission', dailySubmissionSchema);