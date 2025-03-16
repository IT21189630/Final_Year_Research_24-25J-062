const mongoose = require("mongoose");

const recommendationSchema = mongoose.Schema(
  {
    scope: {
      type: String,
      required: [true, "Scope of the recommendation lesson is required!"],
    },
    lesson_type: {
      type: String,
      required: [true, "Lesson type is required!"],
    },
    url: {
      type: String,
      required: [true, "Valid recommendation lesson url required!"],
    },
    description: {
      type: String,
      required: [true, "Recommendation lesson required!"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);
