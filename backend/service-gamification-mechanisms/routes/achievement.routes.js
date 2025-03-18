const express = require("express");
const router = express.Router();
const {
	initializeAchievements,
	getAllAchievements,
	getUserAchievements,
	checkAndAwardAchievements,
	getUserXp,
} = require("../controllers/achievement.controller");

// Initialize default achievements
router.post("/achievements/initialize", initializeAchievements);

// Get all achievements (visible and partially_hidden only)
router.get("/achievements", getAllAchievements);

// Get user's achievements (both unlocked and locked)
router.get("/achievements/user/:userId", getUserAchievements);

// Check and award achievements for a user
router.post("/achievements/check/:userId", checkAndAwardAchievements);

// Get user's XP
router.get("/xp/:userId", getUserXp);

module.exports = router;
