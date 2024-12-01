const path = require("path");
const Submission = require("../models/submission.model");
const { renderHtmlCss } = require("../utils/puppeteerUtils");
const { compareImages } = require("../utils/imageUtils");

exports.submitCode = async (req, res) => {
  const { htmlCode, cssCode, challengeId, userId, username } = req.body;

  try {
    // Render the HTML/CSS and take a screenshot
    const screenshotPath = await renderHtmlCss(htmlCode, cssCode, challengeId);

    // Compare with the reference image
    const referencePath =  path.join(__dirname, `../reference-images/67482a990ff156a20f5632d2.png`);
    const visualSimilarity = await compareImages(screenshotPath, referencePath, htmlCode);

    // Save the submission to the database
    const submission = new Submission({
      userId,
      username,
      challengeId,
      visualSimilarity
    });
    await submission.save();

    res.status(200).send({ visualSimilarity });
  } catch (error) {
    console.error("Error processing submission:", error);
    res.status(500).send({ error: "Failed to process submission" });
  }
};
