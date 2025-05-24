const { generateLessonFeedback } = require("../config/huggingface");

const getAdvancedFeedback = async (req, res) => {
	const { code, lessonId, userId, performance, expectedSolution } = req.body;

	if (!code || !lessonId) {
		return res.status(400).json({
			success: false,
			error: "Missing required fields: code and lessonId are required.",
		});
	}

	try {
		// Generate AI feedback using Hugging Face
		const feedback = await generateLessonFeedback(
			lessonId,
			code,
			expectedSolution || getDefaultExpectedSolution(lessonId),
			performance || {}
		);

		res.status(200).json({
			success: true,
			feedback: feedback,
			lessonId: lessonId,
		});
	} catch (error) {
		console.error("Error generating AI feedback:", error);

		// Fallback to encouraging message if AI fails
		const fallbackFeedback = getFallbackFeedback(lessonId, performance);

		res.status(200).json({
			success: true,
			feedback: fallbackFeedback,
			lessonId: lessonId,
			isAIGenerated: false,
		});
	}
};

/**
 * Get default expected solutions for lessons
 */
const getDefaultExpectedSolution = (lessonId) => {
	const solutions = {
		lesson01: `
      // Expected solution for JavaScript Variables lesson:
      let missionName = "Space Exploration";
      let astronautName = "Space Cadet";
      let missionDay = 1;
    `,
		lesson02:
			"Working with JavaScript data types and performing basic operations.",
		lesson03:
			"Creating functions with proper parameter handling and understanding scope.",
		lesson04: "Manipulating arrays and objects using JavaScript methods.",
		lesson05: "Using DOM methods to select and modify HTML elements.",
	};

	return (
		solutions[lessonId] ||
		"Complete the JavaScript programming exercise as instructed."
	);
};

/**
 * Provide fallback feedback if AI generation fails
 */
const getFallbackFeedback = (lessonId, performance) => {
	const baseMessages = [
		"Great work completing this lesson! Your code demonstrates good understanding of the concepts.",
		"Well done! You've successfully tackled this JavaScript challenge.",
		"Excellent progress! You're building strong programming fundamentals.",
	];

	const randomBase =
		baseMessages[Math.floor(Math.random() * baseMessages.length)];

	let performanceNote = "";
	if (performance && performance.hintsUsed !== undefined) {
		if (performance.hintsUsed === 0) {
			performanceNote =
				" You solved this without using any hints - impressive!";
		} else if (performance.hintsUsed <= 2) {
			performanceNote =
				" You made good use of the available hints to guide your solution.";
		}
	}

	return (
		randomBase +
		performanceNote +
		" Keep practicing to strengthen your JavaScript skills!"
	);
};

module.exports = { getAdvancedFeedback };
