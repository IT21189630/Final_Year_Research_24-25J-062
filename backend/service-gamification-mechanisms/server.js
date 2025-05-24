require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require("./middlewares/errorMiddleware");
const connectDB = require("./config/connectDb");
const verifyJWT = require("./middlewares/verifyJWTMiddleware");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const achievementRoutes = require("./routes/achievement.routes");
const walletRoutes = require("./routes/virtualCurrency.routes");
const axios = require("axios");
const Leaderboard = require("./models/leaderboard.model");

connectDB();
const app = express();
const PORT = process.env.PORT || 4004;

// Update CORS to accept all origins during development
app.use(
	cors({
		origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add achievement routes before JWT verification
app.use("/gamified-learning/api/gamification", achievementRoutes);

// Protected routes that need JWT verification
// app.use("/gamified-learning/api/gamification/protected", verifyJWT);

// Routes that don't need JWT verification
app.use("/gamified-learning/api/gamification", leaderboardRoutes);
app.use("/gamified-learning/api/gamification", walletRoutes);

// Apply error handling middleware
app.use(errorHandler);

let serverPromise = new Promise((resolve, reject) => {
	mongoose.connection.once("open", () => {
		console.log(`🚀 data connection with users collection established! 🚀`);
		const server = app.listen(PORT, () => {
			console.log(
				`🚀 Gamification mechanisms service is up and running on port: ${PORT} 🚀`
			);

			// Set up scheduled leaderboard sync (every 6 hours)
			const syncLeaderboardScheduled = async () => {
				try {
					console.log("Starting scheduled leaderboard sync...");

					// First, authenticate with the user management service to get a token
					const authResponse = await axios.post(
						"http://localhost:4000/gamified-learning/api/user-management/auth/login",
						{
							email:
								process.env.SERVICE_ACCOUNT_EMAIL ||
								"admin@example.com",
							password:
								process.env.SERVICE_ACCOUNT_PASSWORD ||
								"admin123",
						}
					);

					if (!authResponse.data || !authResponse.data.access_token) {
						console.error(
							"Failed to authenticate with user management service: Could not obtain access token"
						);
						return;
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
						console.error(
							"Failed to fetch performance records: Invalid response format"
						);
						return;
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
					const updatePromises = Object.keys(userScores).map(
						async (userId) => {
							const { totalScore, lessonCount } =
								userScores[userId];

							// Find or create leaderboard entry
							let leaderboardEntry = await Leaderboard.findOne({
								userId,
							});

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
						}
					);

					await Promise.all(updatePromises);
					console.log(
						`Leaderboard sync completed. Updated ${
							Object.keys(userScores).length
						} users.`
					);
				} catch (error) {
					console.error(
						"Error in scheduled leaderboard sync:",
						error
					);
				}
			};

			// Run initial sync
			syncLeaderboardScheduled();

			// Schedule regular sync (every 6 hours = 6 * 60 * 60 * 1000 ms)
			setInterval(syncLeaderboardScheduled, 6 * 60 * 60 * 1000);

			resolve(server);
		});
	});
});

module.exports = { app, serverPromise };
