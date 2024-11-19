const express = require("express");
const router = express.Router();
const {
  getProgressByCourseId,
  getProgressByUserId,
  createCourseProgress,
  updateCourseProgress,
} = require("../controllers/progress.controller");

router.get("/user/:id", getProgressByUserId);
router.get("/course/:id", getProgressByCourseId);
router.post("/create", createCourseProgress);
router.put("/update/:courseId", updateCourseProgress);

module.exports = router;
