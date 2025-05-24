const { Achievement, UserAchievement } = require("../models/achievement.model");
const UserExperience = require("../models/userExperience.model");
const Leaderboard = require("../models/leaderboard.model");
const mongoose = require("mongoose");

// Initialize default achievements
const initializeAchievements = async (req, res) => {
	try {
		// Check if achievements already exist
		const achievementsCount = await Achievement.countDocuments();

		if (achievementsCount === 0) {
			// Define the default achievements
			const defaultAchievements = [
				{
					name: "Launch Pad Coder",
					description:
						"Complete 5 lessons. You've ignited your engines and taken your first steps into the coding universe!",
					xpReward: 50,
					icon: "launch_pad_coder.png",
					type: "lesson_completion",
					threshold: 5,
					rarity: "common",
					visibility: "visible",
				},
				{
					name: "Orbit Trainee",
					description:
						"Earn 500 points. You're now in orbit, circling the basics and gaining confidence in coding.",
					xpReward: 75,
					icon: "orbit_trainee.png",
					type: "score_milestone",
					threshold: 500,
					rarity: "common",
					visibility: "visible",
				},
				{
					name: "Stellar Scripter",
					description:
						"Complete 10 lessons. You're writing code that shines bright like a star in the galaxy.",
					xpReward: 100,
					icon: "stellar_scripter.png",
					type: "lesson_completion",
					threshold: 10,
					rarity: "common",
					visibility: "visible",
				},
				{
					name: "Galactic Logic Pilot",
					description:
						"Earn 1,000 points. You're navigating through loops, conditions, and logic like a pro space pilot.",
					xpReward: 150,
					icon: "galactic_logic_pilot.png",
					type: "score_milestone",
					threshold: 1000,
					rarity: "rare",
					visibility: "partially_hidden",
				},
				{
					name: "Cosmic Coder",
					description:
						"Complete 15 lessons. You're building projects that feel out of this world!",
					xpReward: 200,
					icon: "cosmic_coder.png",
					type: "lesson_completion",
					threshold: 15,
					rarity: "rare",
					visibility: "partially_hidden",
				},
				{
					name: "Nebula Problem Solver",
					description:
						"Earn 2,000 points. You're tackling complex coding challenges like a cosmic explorer.",
					xpReward: 250,
					icon: "nebula_problem_solver.png",
					type: "score_milestone",
					threshold: 2000,
					rarity: "rare",
					visibility: "partially_hidden",
				},
				{
					name: "Interstellar Developer",
					description:
						"Complete 20 lessons. You're confidently building and launching projects across the coding galaxy.",
					xpReward: 350,
					icon: "interstellar_developer.png",
					type: "lesson_completion",
					threshold: 20,
					rarity: "epic",
					visibility: "partially_hidden",
				},
				{
					name: "Astro Algorithmist",
					description:
						"Earn 5,000 points. You're mastering algorithms and data structures, the building blocks of the coding universe.",
					xpReward: 500,
					icon: "astro_algorithmist.png",
					type: "score_milestone",
					threshold: 5000,
					rarity: "epic",
					visibility: "hidden",
				},
				{
					name: "Planet-Scale Programmer",
					description:
						"Complete 30 lessons. You're creating code that could power entire planets!",
					xpReward: 750,
					icon: "planet_scale_programmer.png",
					type: "lesson_completion",
					threshold: 30,
					rarity: "legendary",
					visibility: "hidden",
				},
				{
					name: "The Galactic Code Master",
					description:
						"Earn 10,000 points. You've reached the pinnacle of coding mastery, ruling the entire coding universe.",
					xpReward: 1000,
					icon: "galactic_code_master.png",
					type: "score_milestone",
					threshold: 10000,
					rarity: "legendary",
					visibility: "hidden",
				},
			];

			// Insert all achievements
			await Achievement.insertMany(defaultAchievements);
			return res.status(200).json({
				success: true,
				message: "Default achievements initialized successfully",
				count: defaultAchievements.length,
			});
		}

		return res.status(200).json({
			success: true,
			message: "Achievements already initialized",
			count: achievementsCount,
		});
	} catch (error) {
		console.error("Error initializing achievements:", error);
		return res.status(500).json({
			success: false,
			error: "Failed to initialize achievements",
		});
	}
};

// Get all achievements (visible and partially hidden only)
const getAllAchievements = async (req, res) => {
	try {
		const achievements = await Achievement.find({
			visibility: { $in: ["visible", "partially_hidden"] },
		});

		return res.status(200).json(achievements);
	} catch (error) {
		console.error("Error fetching achievements:", error);
		return res.status(500).json({
			success: false,
			error: "Failed to fetch achievements",
		});
	}
};

// Get user's unlocked achievements
const getUserAchievements = async (req, res) => {
	const { userId } = req.params;

	if (!userId) {
		return res.status(400).json({
			success: false,
			error: "User ID is required",
		});
	}

	try {
		// Get user's unlocked achievements
		const userAchievements = await UserAchievement.find({ userId })
			.populate("achievementId")
			.sort({ unlockedAt: -1 });

		// Get user's experience
		let userExperience = await UserExperience.findOne({ userId });
		if (!userExperience) {
			userExperience = { totalXp: 0 };
		}

		// Get all achievements that user hasn't unlocked yet (including hidden ones)
		const unlockedAchievementIds = userAchievements.map((ua) =>
			ua.achievementId._id.toString()
		);
		const lockedAchievements = await Achievement.find({
			_id: { $nin: unlockedAchievementIds },
		});

		return res.status(200).json({
			unlocked: userAchievements,
			locked: lockedAchievements,
			totalXp: userExperience.totalXp,
		});
	} catch (error) {
		console.error("Error fetching user achievements:", error);
		return res.status(500).json({
			success: false,
			error: "Failed to fetch user achievements",
		});
	}
};

// Check and award achievements for a user
const checkAndAwardAchievements = async (req, res) => {
	const { userId } = req.params;

	if (!userId) {
		return res.status(400).json({
			success: false,
			error: "User ID is required",
		});
	}

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		// Get user's leaderboard data
		const leaderboardEntry = await Leaderboard.findOne({ userId });
		if (!leaderboardEntry) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({
				success: false,
				error: "User not found in leaderboard",
			});
		}

		const { totalScore, lessonCount } = leaderboardEntry;

		// Get achievements user has already unlocked
		const userAchievements = await UserAchievement.find({ userId });
		const unlockedAchievementIds = userAchievements.map((ua) =>
			ua.achievementId.toString()
		);

		// Find eligible lesson completion achievements
		const lessonAchievements = await Achievement.find({
			_id: { $nin: unlockedAchievementIds },
			type: "lesson_completion",
			threshold: { $lte: lessonCount },
		});

		// Find eligible score milestone achievements
		const scoreAchievements = await Achievement.find({
			_id: { $nin: unlockedAchievementIds },
			type: "score_milestone",
			threshold: { $lte: totalScore },
		});

		const newlyUnlockedAchievements = [
			...lessonAchievements,
			...scoreAchievements,
		];

		if (newlyUnlockedAchievements.length === 0) {
			await session.abortTransaction();
			session.endSession();
			return res.status(200).json({
				success: true,
				message: "No new achievements unlocked",
				unlockedAchievements: [],
				xpEarned: 0,
			});
		}

		// Calculate total XP from newly unlocked achievements
		const totalXpEarned = newlyUnlockedAchievements.reduce(
			(sum, achievement) => sum + achievement.xpReward,
			0
		);

		// Create user achievement entries
		const userAchievementEntries = newlyUnlockedAchievements.map(
			(achievement) => ({
				userId,
				achievementId: achievement._id,
				unlockedAt: new Date(),
			})
		);

		await UserAchievement.insertMany(userAchievementEntries, { session });

		// Update user's XP
		let userExperience = await UserExperience.findOne({ userId });
		if (!userExperience) {
			userExperience = new UserExperience({
				userId,
				totalXp: totalXpEarned,
			});
		} else {
			userExperience.totalXp += totalXpEarned;
		}
		await userExperience.save({ session });

		await session.commitTransaction();
		session.endSession();

		return res.status(200).json({
			success: true,
			message: `Unlocked ${newlyUnlockedAchievements.length} new achievements!`,
			unlockedAchievements: newlyUnlockedAchievements,
			xpEarned: totalXpEarned,
			newTotalXp: userExperience.totalXp,
		});
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		console.error("Error checking achievements:", error);
		return res.status(500).json({
			success: false,
			error: "Failed to check achievements",
		});
	}
};

// Get user's XP
const getUserXp = async (req, res) => {
	const { userId } = req.params;

	if (!userId) {
		return res.status(400).json({
			success: false,
			error: "User ID is required",
		});
	}

	try {
		let userExperience = await UserExperience.findOne({ userId });
		if (!userExperience) {
			userExperience = { totalXp: 0 };
		}

		return res.status(200).json({
			userId,
			totalXp: userExperience.totalXp,
		});
	} catch (error) {
		console.error("Error fetching user XP:", error);
		return res.status(500).json({
			success: false,
			error: "Failed to fetch user XP",
		});
	}
};

module.exports = {
	initializeAchievements,
	getAllAchievements,
	getUserAchievements,
	checkAndAwardAchievements,
	getUserXp,
};
