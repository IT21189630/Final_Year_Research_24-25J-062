const mongoose = require("mongoose");

const submissionSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    challengeId: {
      type: String,
      required: true,
    },

    visualSimilarity: {
      type: Number,
      required: true,
    },

    submittedAt: { type: Date, default: Date.now },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
