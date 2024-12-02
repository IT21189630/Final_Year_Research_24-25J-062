const Achievement = require("../models/achievement.model");

const updateAchievements = async (req, res) => {
  const { userId, newAchievements } = req.body;

  if (!userId || !newAchievements) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    let achievement = await Achievement.findOne({ userId });

    if (!achievement) {
      achievement = new Achievement({ userId, achievements: [] });
    }

    // Add new achievements
    newAchievements.forEach((ach) => {
      achievement.achievements.push({
        name: ach.name,
        description: ach.description,
      });
    });

    await achievement.save();
    res.status(200).json({ success: true, achievement });
  } catch (error) {
    console.error("Error updating achievements:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { updateAchievements };
