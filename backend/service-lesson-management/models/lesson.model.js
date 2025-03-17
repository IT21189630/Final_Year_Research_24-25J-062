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
      type: [String],
      required: [true, "At least one valid lesson URL is required!"],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one URL must be provided!",
      },
    },
    description: {
      type: String,
      required: [true, "Lesson description required!"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
