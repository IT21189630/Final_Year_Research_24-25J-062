const express = require("express");
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createNewCourse,
  updateCourseById,
  deleteCourseById,
} = require("../controllers/course.controller");

router.get("/courses", getAllCourses);
router.get("/courses/:id", getCourseById);
router.post("/courses", createNewCourse);
router.put("/courses/:id", updateCourseById);
router.delete("/courses/:id", deleteCourseById);

module.exports = router;
