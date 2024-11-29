const mongoose = require("mongoose");

const submissionSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    challengeId: {
      type: String,
      required: true,
    },

    Similarity: {
      type: String,
      required: true,
    },

    submittedAt: { type: Date, default: Date.now },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
