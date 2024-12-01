const mongoose = require("mongoose");

const supplimentaryLessonSchema = mongoose.Schema(
  {
    user_id: {
      type: String,
      required: [true, "User id is required!"],
    },
    recommendation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recommendation",
      required: [true, "Recommendation lesson id is required!"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Supplimentary_Lesson",
  supplimentaryLessonSchema
);
