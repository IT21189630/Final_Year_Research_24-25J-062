const mongoose = require("mongoose");

// Achievement definition schema
const achievementSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		xpReward: {
			type: Number,
			required: true,
		},
		icon: {
			type: String,
			default: "default_achievement_icon.png",
		},
		type: {
			type: String,
			enum: ["lesson_completion", "score_milestone"],
			required: true,
		},
		threshold: {
			type: Number,
			required: true,
		},
		rarity: {
			type: String,
			enum: ["common", "rare", "epic", "legendary"],
			default: "common",
		},
		visibility: {
			type: String,
			enum: ["visible", "partially_hidden", "hidden"],
			default: "visible",
		},
	},
	{
		timestamps: true,
	}
);

// User Achievement schema - tracks which achievements a user has unlocked
const userAchievementSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		achievementId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Achievement",
			required: true,
		},
		unlockedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

const Achievement = mongoose.model("Achievement", achievementSchema);
const UserAchievement = mongoose.model(
	"UserAchievement",
	userAchievementSchema
);

module.exports = { Achievement, UserAchievement };
