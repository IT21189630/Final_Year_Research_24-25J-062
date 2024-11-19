const mongoose = require("mongoose");

const courseSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Course name is required!"],
    },
    image: {
      type: String,
      required: [true, "Course image is required!"],
    },
    price: {
      type: Number,
      required: [true, "Course price is required!"],
      min: [0, "Price must be a positive number!"],
    },
    description: {
      type: String,
      required: [true, "Course description is required!"],
    },
    prerequisites: {
      type: String,
      default: "none",
    },
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
        required: [true, "Course must contain at least one lesson!"],
      },
    ],
    vibility: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
