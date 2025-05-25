const express = require("express");
const router = express.Router();
const {
	getLeaderboard,
	updateUserScore,
	syncLeaderboard,
	addJsScore,
} = require("../controllers/leaderboard.controller");

// Endpoint: Fetch leaderboard
router.get("/leaderboard", getLeaderboard);

// Endpoint: Update user score
router.post("/leaderboard/update-score", updateUserScore);

// Endpoint: Sync leaderboard with performance records
router.post("/leaderboard/sync", syncLeaderboard);

// Endpoint: Add JS lesson score to leaderboard
router.post("/leaderboard/add-js-score", addJsScore);

module.exports = router;
