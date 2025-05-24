const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    lessonId: {
      type: String,
      required: true,
    },
    code: {
      type: String, 
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    completionTime: {
      type: Number, 
      required: true,
    },
    hintsUsed: {
      type: Number,
      default: 0,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    feedbackHistory: [
      {
        feedback: String, 
        timestamp: Date,
      },
    ],
    
  },
  {
    timestamps: true, 
  }
);

const Performance = mongoose.model("Performance", performanceSchema);

module.exports = Performance;
