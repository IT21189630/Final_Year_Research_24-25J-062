const mongoose = require("mongoose");

const jsProgressSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
			unique: true, // One progress record per user
		},
		completedLessons: [
			{
				lessonId: {
					type: String,
					required: true, // lesson01, lesson02, etc.
				},
				bestScore: {
					type: Number,
					required: true,
				},
				completionDate: {
					type: Date,
					default: Date.now,
				},
				attempts: {
					type: Number,
					default: 1,
				},
			},
		],
		totalJsScore: {
			type: Number,
			default: 0,
		},
		lastUpdated: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

// Method to check if a lesson is completed
jsProgressSchema.methods.isLessonCompleted = function (lessonId) {
	return this.completedLessons.some((lesson) => lesson.lessonId === lessonId);
};

// Method to get completed lesson count
jsProgressSchema.methods.getCompletedCount = function () {
	return this.completedLessons.length;
};

// Method to get best score for a lesson
jsProgressSchema.methods.getBestScore = function (lessonId) {
	const lesson = this.completedLessons.find(
		(lesson) => lesson.lessonId === lessonId
	);
	return lesson ? lesson.bestScore : 0;
};

const JsProgress = mongoose.model("JsProgress", jsProgressSchema);

module.exports = JsProgress;
