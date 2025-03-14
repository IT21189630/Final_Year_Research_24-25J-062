const DailySubmission = require('../models/dailySubmission.model');
const DailyChallenge = require('../models/dailyChallenge.model');
const puppeteer = require('puppeteer');
const { compareImages } = require('../utils/imageComparison');
const fs = require('fs').promises;
const path = require('path');

// Create a submission for a challenge
const submitChallenge = async (req, res) => {
  try {
    const { challengeId, htmlCode, cssCode } = req.body;
    const userId = req.user.id; // Assuming user info is available from auth middleware
    
    // Check if challenge exists
    const challenge = await DailyChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }
    
    // Generate image from user's HTML/CSS
    const submissionImagePath = await generateImageFromCode(htmlCode, cssCode);
    
    // Compare with reference image to get score
    const score = await compareImages(challenge.referenceImage, submissionImagePath);
    
    // Create submission record
    const submission = new DailySubmission({
      challenge: challengeId,
      user: userId,
      htmlCode,
      cssCode,
      score
    });
    
    await submission.save();
    
    // Clean up temporary submission image after comparison
    await fs.unlink(submissionImagePath);
    
    res.status(201).json({
      success: true,
      message: 'Challenge submitted successfully',
      submission: {
        id: submission._id,
        score: submission.score,
        submittedAt: submission.submittedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit challenge',
      error: error.message
    });
  }
};

// Get submissions for a specific user
const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const submissions = await DailySubmission.find({ user: userId })
      .populate({
        path: 'challenge',
        select: 'title description difficultyLevel'
      })
      .sort({ submittedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions',
      error: error.message
    });
  }
};

// Helper function to generate an image from HTML/CSS code
const generateImageFromCode = async (htmlCode, cssCode) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Combine HTML and CSS
  const content = `
    <html>
      <head>
        <style>${cssCode}</style>
      </head>
      <body>
        ${htmlCode}
      </body>
    </html>
  `;
  
  await page.setContent(content);
  
  // Take a screenshot
  const outputPath = path.join('screenshots', `submission-${Date.now()}.png`);
  await page.screenshot({ path: outputPath });
  
  await browser.close();
  return outputPath;
};

module.exports = {
  submitChallenge,
  getUserSubmissions
};