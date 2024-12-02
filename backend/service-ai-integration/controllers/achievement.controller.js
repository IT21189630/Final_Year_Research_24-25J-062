const Performance = require("../models/performance.model");

const predictAchievements = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "UserId is required." });
  }

  try {
    const performances = await Performance.find({ userId });

    if (!performances || performances.length === 0) {
      return res.status(404).json({ error: "No performance data found for this user." });
    }

    // Predict achievements based on performance data
    const achievements = [];
    const completedLessons = performances.length;

    // Example: Add achievements based on user data
    if (completedLessons >= 5) {
      achievements.push({
        name: "Explorer",
        description: "Completed 5 lessons.",
      });
    }

    const totalScore = performances.reduce((sum, perf) => sum + perf.score, 0);
    if (totalScore > 400) {
      achievements.push({
        name: "High Scorer",
        description: "Achieved a total score of over 400.",
      });
    }

    res.status(200).json({ achievements });
  } catch (error) {
    console.error("Error predicting achievements:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { predictAchievements };
