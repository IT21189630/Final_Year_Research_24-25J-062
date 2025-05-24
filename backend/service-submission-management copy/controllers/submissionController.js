const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const aiEvaluator = require('../utils/aiEvaluator');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs-extra');

exports.createSubmission = async (req, res) => {
  try {
    const { challengeId, htmlCode, cssCode } = req.body;
    const userId = req.user.id;

    // Find the challenge
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        message: 'Challenge not found' 
      });
    }

    // Create temporary HTML file with submitted code
    const tempDir = path.join(__dirname, '../uploads/temp');
    await fs.ensureDir(tempDir);
    
    const tempHtmlPath = path.join(tempDir, `${userId}_${Date.now()}.html`);
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${cssCode}</style>
      </head>
      <body>
        ${htmlCode}
      </body>
      </html>
    `;
    
    await fs.writeFile(tempHtmlPath, htmlContent);
    
    // Take screenshot using Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`file://${tempHtmlPath}`);
    
    const submissionsDir = path.join(__dirname, '../uploads/submissions');
    await fs.ensureDir(submissionsDir);
    
    const submissionImagePath = path.join(submissionsDir, `${userId}_${challengeId}_${Date.now()}.png`);
    await page.screenshot({ path: submissionImagePath });
    await browser.close();
    
    // Evaluate submission using AI
    const { similarityScore, feedback } = await aiEvaluator.evaluateSubmission(
      challenge.referenceImagePath,
      submissionImagePath
    );
    
    // Create submission record
    const submission = new Submission({
      user: userId,
      challenge: challengeId,
      submissionImagePath,
      htmlCode,
      cssCode,
      similarityScore,
      feedback
    });
    
    await submission.save();
    
    // Clean up temporary file
    await fs.remove(tempHtmlPath);
    
    res.status(201).json({
      success: true,
      data: {
        submission,
        similarityScore,
        feedback
      }
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user.id })
      .populate('challenge')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('Error getting submissions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};