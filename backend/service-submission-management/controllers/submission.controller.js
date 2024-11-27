const { model } = require("mongoose");
const submissionModel = require("../models/submission.model");
const asyncHandler = require("express-async-handler");

const storeSubmission = asyncHandler(async (req, res) => {
    const { userId, challengeId, htmlCode, cssCode } = req.body;

    try {
        const submission = new submissionModel({
            userId,
            challengeId,
            htmlCode,
            cssCode,
        });
        
        await submission.save();
        res.status(200).send({ message: 'Submission stored successfully' });

	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

module.exports = {
	storeSubmission
};
