const JsProgress = require("../models/jsProgress.model");
const axios = require("axios");

// Get user's JS lesson progress
const getJsProgress = async (req, res) => {
	const { userId } = req.params;

	if (!userId) {
		return res.status(400).json({
			success: false,
			error: "User ID is required",
		});
	}

	try {
		let progress = await JsProgress.findOne({ userId });

		if (!progress) {
			// Create new progress record if doesn't exist
			progress = new JsProgress({
				userId,
				completedLessons: [],
				totalJsScore: 0,
			});
			await progress.save();
		}

		res.status(200).json({
			success: true,
			progress: {
				userId: progress.userId,
				completedLessons: progress.completedLessons,
				totalJsScore: progress.totalJsScore,
				completedCount: progress.getCompletedCount(),
				lastUpdated: progress.lastUpdated,
			},
		});
	} catch (error) {
		console.error("Error fetching JS progress:", error);
		res.status(500).json({
			success: false,
			error: "Internal server error",
		});
	}
};

// Mark a JS lesson as completed
const markLessonComplete = async (req, res) => {
	const { userId, lessonId, score } = req.body;

	if (!userId || !lessonId || score === undefined) {
		return res.status(400).json({
			success: false,
			error: "User ID, lesson ID, and score are required",
		});
	}

	try {
		let progress = await JsProgress.findOne({ userId });

		if (!progress) {
			// Create new progress record
			progress = new JsProgress({
				userId,
				completedLessons: [],
				totalJsScore: 0,
			});
		}

		// Check if lesson already completed
		const existingLessonIndex = progress.completedLessons.findIndex(
			(lesson) => lesson.lessonId === lessonId
		);

		let scoreToAdd = 0;

		if (existingLessonIndex !== -1) {
			// Lesson already completed, update if new score is better
			const existingLesson =
				progress.completedLessons[existingLessonIndex];
			if (score > existingLesson.bestScore) {
				scoreToAdd = score - existingLesson.bestScore; // Only add the difference
				existingLesson.bestScore = score;
				existingLesson.attempts += 1;
				existingLesson.completionDate = new Date();
			} else {
				existingLesson.attempts += 1;
				// No score improvement
			}
		} else {
			// New lesson completion
			progress.completedLessons.push({
				lessonId,
				bestScore: score,
				completionDate: new Date(),
				attempts: 1,
			});
			scoreToAdd = score;
		}

		// Update total score
		progress.totalJsScore += scoreToAdd;
		progress.lastUpdated = new Date();

		await progress.save();

		// If there's a score improvement or new completion, update the leaderboard
		if (scoreToAdd > 0) {
			try {
				await axios.post(
					"http://localhost:4004/gamified-learning/api/gamification/leaderboard/add-js-score",
					{
						userId,
						score: scoreToAdd,
					}
				);
			} catch (error) {
				console.error("Error updating leaderboard:", error);
				// Don't fail the lesson completion if leaderboard update fails
			}
		}

		res.status(200).json({
			success: true,
			message:
				existingLessonIndex !== -1
					? "Lesson progress updated"
					: "Lesson completed",
			progress: {
				userId: progress.userId,
				completedLessons: progress.completedLessons,
				totalJsScore: progress.totalJsScore,
				completedCount: progress.getCompletedCount(),
				scoreAdded: scoreToAdd,
			},
		});
	} catch (error) {
		console.error("Error marking lesson complete:", error);
		res.status(500).json({
			success: false,
			error: "Internal server error",
		});
	}
};

// Get all JS progress (for admin purposes)
const getAllJsProgress = async (req, res) => {
	try {
		const allProgress = await JsProgress.find({}).sort({
			totalJsScore: -1,
		});

		res.status(200).json({
			success: true,
			progress: allProgress,
			totalUsers: allProgress.length,
		});
	} catch (error) {
		console.error("Error fetching all JS progress:", error);
		res.status(500).json({
			success: false,
			error: "Internal server error",
		});
	}
};

module.exports = {
	getJsProgress,
	markLessonComplete,
	getAllJsProgress,
};
