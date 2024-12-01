// const path = require("path");
// const Submission = require("../models/submission.model");
// const { renderHtmlCss } = require("../utils/puppeteerUtils");
// const { compareImages } = require("../utils/imageUtils");

// exports.submitCode = async (req, res) => {
//   const { htmlCode, cssCode, challengeId, userId, username } = req.body;

//   try {
//     // Render the HTML/CSS and take a screenshot
//     const screenshotPath = await renderHtmlCss(htmlCode, cssCode, challengeId);

//     // Compare with the reference image
//     const referencePath =  path.join(__dirname, `../reference-images/67482a990ff156a20f5632d2.png`);
//     const visualSimilarity = await compareImages(screenshotPath, referencePath, htmlCode);

//     // Save the submission to the database
//     const submission = new Submission({
//       userId,
//       username,
//       challengeId,
//       visualSimilarity
//     });
//     await submission.save();

//     res.status(200).send({ visualSimilarity });
//   } catch (error) {
//     console.error("Error processing submission:", error);
//     res.status(500).send({ error: "Failed to process submission" });
//   }
// };


// const fs = require("fs");
// const runPythonScript = require("../utils/pythonRunner");

// exports.checkSimilarity = async (req, res) => {
//   const { htmlCode, cssCode } = req.body;
//   const referenceImagePath = path.resolve("uploads/refImg1.png"); // Reference image

//   // Generate paths
//   const userImagePath = path.resolve(`uploads/rendered_${Date.now()}.png`);

//   try {
//     // Render HTML/CSS into an image
//     await renderHtmlCss(htmlCode, cssCode, userImagePath);

//     // Run Python similarity checker
//     const result = await runPythonScript(userImagePath, referenceImagePath);

//     // Clean up rendered image
//     fs.unlinkSync(userImagePath);

//     res.json({ similarity: result.similarity });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error processing submission" });
//   }
// };


const path = require('path');
const axios = require('axios');
const { renderHtmlToImage } = require('../utils/render');
const Submission = require("../models/submission.model");

const REFERENCE_IMAGE = path.join(__dirname, '../reference-images/refImg1.png');

exports.checkSimilarity = async (req, res) => {
  const { htmlCode, cssCode } = req.body;

  if (!htmlCode || !cssCode) {
    return res.status(400).json({ error: 'HTML and CSS code are required.' });
  }

  try {
    const userImagePath = path.join(__dirname, '../reference-images/user_image.png');

    // Combine HTML and CSS into a single HTML document
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <style>${cssCode}</style>
      </head>
      <body>
        ${htmlCode}
      </body>
      </html>
    `;

    // Render the combined HTML/CSS code into an image
    await renderHtmlToImage(fullHtml, userImagePath);

    // Send request to Python service for similarity calculation
    const response = await axios.post('http://127.0.0.1:5001/evaluate', {
      user_image: userImagePath,
      reference_image: REFERENCE_IMAGE,
    });

    // Save the submission to the database
    const submission = new Submission({
      userId:"674ac997afe5d075cf9ca8dc",
      username: "Binod Gayasri",
      challengeId : "67482a990ff156a20f5632d2",
      visualSimilarity : response.data.similarity
    });
    await submission.save();

    res.json({ similarity: response.data.similarity });
  } catch (error) {
    console.error('Error during evaluation:', error);
    res.status(500).json({ error: 'Failed to evaluate the challenge.' });
  }
};
