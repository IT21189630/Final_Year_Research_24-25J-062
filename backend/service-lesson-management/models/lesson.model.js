const mongoose = require("mongoose");

const lessonSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required!"],
    },
    level: {
      type: Number,
      required: [true, "Level number is required!"],
    },
    url: {
      type: String,
      required: [true, "Valid lesson url required!"],
    },
    description: {
      type: String,
      required: [true, "Lesson description required!"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
