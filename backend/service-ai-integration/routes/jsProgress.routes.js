const express = require("express");
const router = express.Router();
const {
	getJsProgress,
	markLessonComplete,
	getAllJsProgress,
} = require("../controllers/jsProgress.controller");

// Get user's JS lesson progress
router.get("/user/:userId", getJsProgress);

// Mark a lesson as completed
router.post("/complete", markLessonComplete);

// Get all JS progress (admin endpoint)
router.get("/all", getAllJsProgress);

module.exports = router;
