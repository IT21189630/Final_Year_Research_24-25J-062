const mongoose = require("mongoose");

const performanceSchema = mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: [true, "Lesson id is required!"],
    },
    performance_score: {
      type: Number,
      required: [true, "Performance score is required!"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PerformanceRecord", performanceSchema);
