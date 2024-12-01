const express = require("express");
const router = express.Router();
const {
  getSupplimentaryLessonByUserId,
  createNewSupplimentaryLessonRecord,
} = require("../controllers/supplimentary_lesson.controller");

router.get("/:id", getSupplimentaryLessonByUserId);
router.post("/", createNewSupplimentaryLessonRecord);

module.exports = router;
