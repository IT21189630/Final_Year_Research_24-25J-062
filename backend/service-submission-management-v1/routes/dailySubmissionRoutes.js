const express = require('express');
const router = express.Router();
const DailySubmission = require('../models/DailySubmission');
const DailyChallenge = require('../models/DailyChallenge');
const { compareImages } = require('../utils/imageComparison');
const fs = require('fs');
const path = require('path');

// Helper function to save base64 image
const saveBase64Image = (base64Data) => {
  try {
    // Strip the data URL prefix
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');
    
    // Create a unique filename
    const filename = `submission_${Date.now()}.png`;
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filepath = path.join(uploadDir, filename);
    
    // Write the file
    fs.writeFileSync(filepath, buffer);
    console.log(`Saved submission image: ${filepath}`);
    
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error saving base64 image:', error);
    throw error;
  }
};

// Create a new submission
router.post('/', async (req, res) => {
  try {
    const { challengeId, htmlCode, cssCode, outputImage } = req.body;
    
    if (!challengeId || !htmlCode || !cssCode || !outputImage) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Get the challenge to access the reference image
    const challenge = await DailyChallenge.findById(challengeId);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    console.log('Processing submission for challenge:', challenge.title);
    
    // Save the output image
    const savedImagePath = saveBase64Image(outputImage);
    
    // Get the full path for both images
    const extractRelativePath = (url) => {
      // This regex will extract the path part after the domain
      const matches = url.match(/^(?:https?:\/\/[^\/]+)?(.+)$/);
      return matches ? matches[1] : url;
    };
    
    // Then use it like this
    const imagePath = extractRelativePath(challenge.imageUrl).replace(/^\//, '');
    const referenceImagePath = path.resolve(__dirname, '..', imagePath);
    const submissionImagePath = path.resolve(__dirname, '..', savedImagePath.replace(/^\//, ''));
    
    console.log('Reference image path:', referenceImagePath);
    console.log('Submission image path:', submissionImagePath);
    
    // Compare the images and get a similarity score
    const similarityScore = await compareImages(referenceImagePath, submissionImagePath);
    
    // Add a minimum score to prevent total failure
    const finalScore = Math.max(10, Math.round(similarityScore * 100));
    
    // Create the submission record
    const submission = new DailySubmission({
      challengeId,
      htmlCode,
      cssCode,
      outputImage: savedImagePath,
      score: finalScore
    });
    
    await submission.save();
    
    // Return the result
    res.status(201).json({
      _id: submission._id,
      score: submission.score,
      outputImage: `${req.protocol}://${req.get('host')}${savedImagePath}`,
      submittedAt: submission.submittedAt
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all submissions for a challenge
router.get('/challenge/:challengeId', async (req, res) => {
  try {
    const submissions = await DailySubmission.find({ 
      challengeId: req.params.challengeId 
    }).sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific submission
router.get('/:id', async (req, res) => {
  try {
    const submission = await DailySubmission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    res.json(submission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;