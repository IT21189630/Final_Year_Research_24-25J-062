const Leaderboard = require("../models/leaderboard.model");
const axios = require("axios");

const getLeaderboard = async (req, res) => {
	try {
		// Fetch top 10 users (by score)
		const leaderboard = await Leaderboard.find({})
			.sort({ totalScore: -1 })
			.limit(10);

		// First, authenticate with the user management service to get a token
		const authResponse = await axios.post(
			"http://localhost:4000/gamified-learning/api/user-management/auth/login",
			{
				email: process.env.SERVICE_ACCOUNT_EMAIL || "admin@example.com",
				password: process.env.SERVICE_ACCOUNT_PASSWORD || "admin123",
			}
		);

		if (!authResponse.data || !authResponse.data.access_token) {
			return res.status(500).json({
				error: "Failed to authenticate with user management service",
				details: "Could not obtain access token",
			});
		}

		const token = authResponse.data.access_token;

		// Enhance leaderboard with user details
		const enhancedLeaderboard = await Promise.all(
			leaderboard.map(async (entry) => {
				try {
					// Get user details from user management service with authentication
					const userResponse = await axios.get(
						`http://localhost:4000/gamified-learning/api/user-management/users/${entry.userId}`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					);

					const userData = userResponse.data;

					return {
						...entry.toObject(),
						username: userData.username,
						profile_picture: userData.profile_picture || null,
					};
				} catch (error) {
					console.error(
						`Error fetching user details for ${entry.userId}:`,
						error
					);
					// Return entry without user details if fetch fails
					return entry.toObject();
				}
			})
		);

		res.status(200).json({
			success: true,
			leaderboard: enhancedLeaderboard,
		});
	} catch (error) {
		console.error("Error fetching leaderboard:", error);
		res.status(500).json({ error: "Internal server error." });
	}
};

// Update user score in leaderboard
const updateUserScore = async (req, res) => {
	const { userId, score } = req.body;

	if (!userId || score === undefined) {
		return res
			.status(400)
			.json({ error: "User ID and score are required." });
	}

	try {
		// Find existing leaderboard entry for user
		let leaderboardEntry = await Leaderboard.findOne({ userId });

		if (leaderboardEntry) {
			// Update existing entry
			leaderboardEntry.totalScore += score;
			leaderboardEntry.lessonCount += 1;
			await leaderboardEntry.save();
		} else {
			// Create new entry
			leaderboardEntry = new Leaderboard({
				userId,
				totalScore: score,
				lessonCount: 1,
			});
			await leaderboardEntry.save();
		}

		res.status(200).json({ success: true, leaderboardEntry });
	} catch (error) {
		console.error("Error updating leaderboard:", error);
		res.status(500).json({ error: "Internal server error." });
	}
};

// Add JS lesson score to existing user score (called by AI Integration Service)
const addJsScore = async (req, res) => {
	const { userId, score } = req.body;

	if (!userId || score === undefined) {
		return res
			.status(400)
			.json({ error: "User ID and score are required." });
	}

	try {
		// Find existing leaderboard entry for user
		let leaderboardEntry = await Leaderboard.findOne({ userId });

		if (leaderboardEntry) {
			// Add JS lesson score to existing total
			leaderboardEntry.totalScore += score;
			leaderboardEntry.lessonCount += 1;
			await leaderboardEntry.save();
		} else {
			// Create new entry for user (first time completing any lesson)
			leaderboardEntry = new Leaderboard({
				userId,
				totalScore: score,
				lessonCount: 1,
			});
			await leaderboardEntry.save();
		}

		res.status(200).json({
			success: true,
			message: "JS lesson score added to leaderboard",
			leaderboardEntry: {
				userId: leaderboardEntry.userId,
				totalScore: leaderboardEntry.totalScore,
				lessonCount: leaderboardEntry.lessonCount,
			},
		});
	} catch (error) {
		console.error("Error adding JS score to leaderboard:", error);
		res.status(500).json({ error: "Internal server error." });
	}
};

// Sync leaderboard with performance records
const syncLeaderboard = async (req, res) => {
	try {
		// First, authenticate with the user management service to get a token
		const authResponse = await axios.post(
			"http://localhost:4000/gamified-learning/api/user-management/auth/login",
			{
				email: process.env.SERVICE_ACCOUNT_EMAIL || "admin@example.com",
				password: process.env.SERVICE_ACCOUNT_PASSWORD || "admin123",
			}
		);

		if (!authResponse.data || !authResponse.data.access_token) {
			return res.status(500).json({
				error: "Failed to authenticate with user management service",
				details: "Could not obtain access token",
			});
		}

		const token = authResponse.data.access_token;

		// Fetch all performance records from lesson management service with the token
		const performanceResponse = await axios.get(
			"http://localhost:4001/gamified-learning/api/lesson-management/performance",
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (
			!performanceResponse.data ||
			!Array.isArray(performanceResponse.data)
		) {
			return res.status(500).json({
				error: "Failed to fetch performance records",
				details:
					"Invalid response format from lesson management service",
			});
		}

		const performanceRecords = performanceResponse.data;

		// Aggregate scores by user_id
		const userScores = {};

		performanceRecords.forEach((record) => {
			const userId = record.user_id;
			const score = record.performance_score || 0;

			if (!userScores[userId]) {
				userScores[userId] = {
					totalScore: 0,
					lessonCount: 0,
				};
			}

			userScores[userId].totalScore += score;
			userScores[userId].lessonCount += 1;
		});

		// Update leaderboard entries
		const updatePromises = Object.keys(userScores).map(async (userId) => {
			const { totalScore, lessonCount } = userScores[userId];

			// Find or create leaderboard entry
			let leaderboardEntry = await Leaderboard.findOne({ userId });

			if (leaderboardEntry) {
				// Update existing entry
				leaderboardEntry.totalScore = totalScore;
				leaderboardEntry.lessonCount = lessonCount;
				return leaderboardEntry.save();
			} else {
				// Create new entry
				const newEntry = new Leaderboard({
					userId,
					totalScore,
					lessonCount,
				});
				return newEntry.save();
			}
		});

		await Promise.all(updatePromises);

		res.status(200).json({
			success: true,
			message: "Leaderboard synchronized successfully",
			usersUpdated: Object.keys(userScores).length,
		});
	} catch (error) {
		console.error("Error synchronizing leaderboard:", error);
		res.status(500).json({
			error: "Internal server error",
			details: error.message,
		});
	}
};

module.exports = {
	getLeaderboard,
	updateUserScore,
	syncLeaderboard,
	addJsScore,
};
