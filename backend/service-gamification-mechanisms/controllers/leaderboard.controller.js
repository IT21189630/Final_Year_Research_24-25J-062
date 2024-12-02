const Leaderboard = require("../models/leaderboard.model");

const getLeaderboard = async (req, res) => {
  try {
    // Fetch top 10 users (by score)
    const leaderboard = await Leaderboard.find({})
      .sort({ totalScore: -1 })
      .limit(10);

    res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { getLeaderboard };
