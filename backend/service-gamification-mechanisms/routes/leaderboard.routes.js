const express = require("express");
const router = express.Router();
const { getLeaderboard } = require("../controllers/leaderboard.controller");

// Endpoint: Fetch leaderboard
router.get("/leaderboard", getLeaderboard);

module.exports = router;
