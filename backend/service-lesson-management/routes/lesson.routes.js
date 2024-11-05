const express = require("express");
const router = express.Router();
const {
  getLessons,
  getLessonById,
  createNewLesson,
  updateLessonById,
  deleteLessonById,
} = require("../controllers/lesson.controller");

router.get("/lessons", getLessons);
router.get("/lessons/:id", getLessonById);
router.post("/lessons", createNewLesson);
router.put("/lessons/:id", updateLessonById);
router.delete("/lessons/:id", deleteLessonById);

module.exports = router;
