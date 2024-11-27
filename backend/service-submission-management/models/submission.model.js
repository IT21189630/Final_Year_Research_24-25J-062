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

    htmlCode: {
      type: String,
      required: true,
    },

    cssCode: {
      type: String,
      required: true,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
