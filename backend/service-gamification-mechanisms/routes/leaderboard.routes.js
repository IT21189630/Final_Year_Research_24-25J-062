const express = require("express");
const router = express.Router();
const {
	getLeaderboard,
	updateUserScore,
	syncLeaderboard,
} = require("../controllers/leaderboard.controller");

// Endpoint: Fetch leaderboard
router.get("/leaderboard", getLeaderboard);

// Endpoint: Update user score
router.post("/leaderboard/update-score", updateUserScore);

// Endpoint: Sync leaderboard with performance records
router.post("/leaderboard/sync", syncLeaderboard);

module.exports = router;
