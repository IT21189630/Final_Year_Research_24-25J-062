const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  submissionImagePath: {
    type: String,
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
  similarityScore: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema, 'dailysubmissions');