const { HfInference } = require("@huggingface/inference");

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);

// Model configuration
const MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.3";

/**
 * Generate AI feedback for lesson completion
 * @param {string} lessonId - The lesson identifier
 * @param {string} userCode - The user's submitted code
 * @param {string} expectedSolution - What the user was supposed to accomplish
 * @param {object} performance - Performance metrics (time, hints, attempts)
 * @returns {Promise<string>} Generated feedback
 */
const generateLessonFeedback = async (
	lessonId,
	userCode,
	expectedSolution,
	performance
) => {
	try {
		// Create lesson-specific prompt for conversational format
		const systemMessage =
			"You are a friendly JavaScript mentor providing personalized feedback to a beginner student who has just completed a lesson. The student has successfully met all lesson requirements. Your role is to encourage them and provide positive reinforcement about their progress. Keep responses to 3 sentences only. Be encouraging and focus on what they did well in following the lesson instructions. Do NOT suggest changes that would conflict with the specific lesson requirements they were asked to follow.";

		const userMessage = createLessonPrompt(
			lessonId,
			userCode,
			expectedSolution,
			performance
		);

		const response = await hf.chatCompletion({
			model: MODEL_NAME,
			messages: [
				{
					role: "system",
					content: systemMessage,
				},
				{
					role: "user",
					content: userMessage,
				},
			],
			max_tokens: 200,
			temperature: 0.7,
		});

		return response.choices[0].message.content.trim();
	} catch (error) {
		console.error("Error generating AI feedback:", error);
		throw new Error("Failed to generate AI feedback");
	}
};

/**
 * Create lesson-specific prompts for AI feedback
 */
const createLessonPrompt = (
	lessonId,
	userCode,
	expectedSolution,
	performance
) => {
	const lessonRequirements = getLessonRequirements(lessonId);

	const prompt = `Please provide feedback on this JavaScript lesson completion:

LESSON CONTEXT: ${getLessonContext(lessonId)}

SPECIFIC REQUIREMENTS: ${lessonRequirements}

Student's Code:
${userCode}

Expected Solution:
${expectedSolution}

Performance Metrics:
- Hints used: ${performance.hintsUsed || 0}
- Completion time: ${performance.completionTime || "N/A"} seconds  
- Attempts: ${performance.attempts || 1}
- Score: ${performance.score || "N/A"} points

IMPORTANT: The student has successfully completed the lesson requirements. Focus your feedback on:
1. What they did well in following the lesson instructions
2. Their coding syntax and approach
3. Encouragement for their progress
4. General JavaScript learning tips that DON'T conflict with the lesson requirements

DO NOT suggest changing variable names or requirements that were specifically instructed in this lesson.`;

	return prompt;
};

/**
 * Get specific lesson requirements to avoid conflicting feedback
 */
const getLessonRequirements = (lessonId) => {
	const requirements = {
		lesson01:
			"Students must use exactly these variable names: missionName (string), astronautName (string), missionDay (number). These names are part of the lesson requirements and should NOT be changed.",
		lesson02:
			"Students must follow the specific data type exercises as instructed in the lesson.",
		lesson03:
			"Students must create functions with the exact names and parameters specified in the lesson.",
		lesson04:
			"Students must use the array and object structures as defined in the lesson requirements.",
		lesson05:
			"Students must select and modify the specific HTML elements mentioned in the lesson instructions.",
	};

	return (
		requirements[lessonId] ||
		"Students must follow the exact requirements specified in the lesson instructions."
	);
};

/**
 * Get lesson-specific context for prompts
 */
const getLessonContext = (lessonId) => {
	const lessonContexts = {
		lesson01:
			"JavaScript Variables and Basic Syntax - Students should declare variables using let keyword for missionName (string), astronautName (string), and missionDay (number).",
		lesson02:
			"Data Types and Operations - Working with different JavaScript data types and basic operations.",
		lesson03:
			"Functions and Scope - Understanding function declarations, parameters, and variable scope.",
		lesson04:
			"Arrays and Objects - Working with JavaScript collections and object properties.",
		lesson05:
			"DOM Manipulation - Selecting and modifying HTML elements with JavaScript.",
	};

	return lessonContexts[lessonId] || "JavaScript programming exercise";
};

module.exports = {
	generateLessonFeedback,
	hf,
};
