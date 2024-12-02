const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema(
  {
    userId: { 
        type: String, 
        required: true 
    },
    totalScore: { 
        type: Number, 
        required: true 
    },
    lessonCount: { 
        type: Number, 
        default: 0 
    },
  },
  {
    timestamps: true,
  }
);

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

module.exports = Leaderboard;
