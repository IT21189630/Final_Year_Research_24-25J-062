const express = require("express");
const router = express.Router();
const { predictAchievements } = require("../controllers/achievement.controller");

// Route to predict achievements
router.get("/predict-achievements/:userId", predictAchievements);

module.exports = router;
