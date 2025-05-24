const Performance = require("../models/performance.model");

const getLeaderboard = async (req, res) => {
  try {
    // Aggregate user scores
    const leaderboard = await Performance.aggregate([
      {
        $group: {
          _id: "$userId",
          totalScore: { $sum: "$score" },
          lessonCount: { $sum: 1 },
        },
      },
      { $sort: { totalScore: -1 } }, // Sort by totalScore descending
      { $limit: 10 }, // Limit to top 10 users
    ]);

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { getLeaderboard };
