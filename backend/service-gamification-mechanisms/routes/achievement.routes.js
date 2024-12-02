const express = require("express");
const router = express.Router();
const { updateAchievements } = require("../controllers/achievement.controller");

// Endpoint: Update achievements
router.post("/update-achievements", updateAchievements);

module.exports = router;
