const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    userId: { 
        type: String, 
        required: true 
    },
    achievements: [
      {
        name: String,
        description: String,
        timestamp: { 
            type: Date, 
            default: Date.now 
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Achievement = mongoose.model("Achievement", achievementSchema);

module.exports = Achievement;
