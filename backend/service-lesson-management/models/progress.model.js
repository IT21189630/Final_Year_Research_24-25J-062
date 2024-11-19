const mongoose = require("mongoose");

const performanceSchema = mongoose.Schema(
  {
    user_id: {
      type: String,
      required: [true, "User id is required!"],
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course id is required!"],
    },
    current_level: {
      type: Number,
      required: [true, "Current level is required!"],
      default: 1,
    },
    current_xp: {
      type: Number,
      required: [true, "XP points are required!"],
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", performanceSchema);
