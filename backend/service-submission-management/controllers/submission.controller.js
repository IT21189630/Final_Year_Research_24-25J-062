const Submission = require("../models/submission.model");
const { renderHtmlCss, compareImages } = require("../utils/puppeteerUtils");

exports.submitHtmlCss = async (req, res) => {
  const { htmlCode, cssCode, challengeId } = req.body;

  try {
    // Render the HTML/CSS and take a screenshot
    const screenshotPath = await renderHtmlCss(htmlCode, cssCode, challengeId);

    // Compare with the reference image
    const referencePath = `reference-images/${challengeId}.png`;
    const similarity = await compareImages(screenshotPath, referencePath);

    // Save the submission to the database
    const submission = new Submission({
      challengeId,
      htmlCode,
      cssCode,
      screenshotPath,
      similarity,
    });
    await submission.save();

    res.status(200).send({ submission });
  } catch (error) {
    console.error("Error processing submission:", error);
    res.status(500).send({ error: "Failed to process submission" });
  }
};
