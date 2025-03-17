// routes/dailySubmissionRoutes.js
const express = require('express');
const router = express.Router();
const DailySubmission = require('../models/DailySubmission');
const DailyChallenge = require('../models/DailyChallenge');
const { compareImages } = require('../utils/imageComparison');
const { evaluateJavaScriptWithCodeBERT } = require('../utils/pythonBridge2');
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
// OPTIONAL: If you want more detailed backend processing feedback
// Modify your dailySubmissionRoutes.js by adding progress stages in your POST handler

// Add this helper function to your dailySubmissionRoutes.js file
const processSubmissionWithStages = async (req, res) => {
  try {
    const { challengeId, htmlCode, cssCode, jsCode, outputImage } = req.body;
    
    // Initial validation
    if (!challengeId || !htmlCode || !cssCode || !outputImage) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Get the challenge
    const challenge = await DailyChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Log the challenge data to verify we have the solution
    console.log(`Challenge ${challenge._id} retrieved:`, {
      title: challenge.title,
      hasJsCode: Boolean(challenge.jscode),
      jsCodeLength: challenge.jscode?.length || 0
    });
    
    // Save the output image
    const savedImagePath = saveBase64Image(outputImage);
    
    // Get image paths
    const extractRelativePath = (url) => {
      const matches = url.match(/^(?:https?:\/\/[^\/]+)?(.+)$/);
      return matches ? matches[1] : url;
    };
    
    const imagePath = extractRelativePath(challenge.imageUrl).replace(/^\//, '');
    const referenceImagePath = path.resolve(__dirname, '..', imagePath);
    const submissionImagePath = path.resolve(__dirname, '..', savedImagePath.replace(/^\//, ''));
    
    // STAGE 1: Compare images
    console.log('Starting image comparison...');
    const similarityScore = await compareImages(referenceImagePath, submissionImagePath);
    const visualScore = Math.max(10, Number((similarityScore * 100).toFixed(2)));
    console.log('Image comparison complete. Score:', visualScore);
    
    // STAGE 2: Evaluate JavaScript if provided
    let jsScore = 0;
    let jsEvaluation = "No JavaScript code provided";
    let correctnessScore = 0;
    
    if (jsCode && jsCode.trim().length > 0) {
      console.log('Starting JavaScript evaluation...');
      try {
        // Make sure we have a solution to compare against
        const solutionCode = challenge.jscode && challenge.jscode.trim() !== "" 
          ? challenge.jscode 
          : "// No reference solution provided";
          
        console.log('Solution code length:', solutionCode.length);
        console.log('User code length:', jsCode.length);
        
        // Pass the correct solution from the challenge model
        const evaluation = await evaluateJavaScriptWithCodeBERT(
          jsCode,
          challenge.title,
          challenge.description,
          solutionCode // Pass the correct solution
        );
        
        // Log the raw evaluation result to debug
        console.log('Raw evaluation result:', JSON.stringify(evaluation));
        
        // Use the score directly from the evaluation result
        jsScore = evaluation.score* 100; // The Python code now returns percentage with decimals
       
      // Get correctness score - if it's 0 but we have a quality score, use a decimal minimum value
        correctnessScore = evaluation.correctnessScore ?
        evaluation.correctnessScore* 100 : // Already a percentage with decimals
        (jsScore > 20.5 ? 20.5 : jsScore);
        
        jsEvaluation = evaluation.feedback;
        
        console.log('JavaScript evaluation processed:', {
          jsScore,
          correctnessScore,
          feedbackLength: jsEvaluation.length
        });
      } catch (jsError) {
        console.error('Error evaluating JavaScript:', jsError);
        jsScore = 10;
        correctnessScore = 10;
        jsEvaluation = `Error evaluating JavaScript: ${jsError.message}`;
      }
    }
    
    // STAGE 3: Calculate overall score
    const overallScore = (
      (0.4 * visualScore) + (0.3 * jsScore) + (0.3 * correctnessScore)
    );
    console.log('Final scores:', {
      visualScore,
      jsScore,
      correctnessScore,
      overallScore
    });
    
    const submission = new DailySubmission({
      challengeId,
      htmlCode,
      cssCode,
      jsCode,
      outputImage: savedImagePath,
      visualScore: visualScore, // Keep original decimal value from Python
      jsScore: jsScore, // Keep original decimal value from Python
      correctnessScore: correctnessScore, // Keep original decimal value from Python
      jsEvaluation: jsEvaluation,
      score: overallScore // Keep calculated decimal value
    });
    
    await submission.save();
    
    return {
      _id: submission._id,
      score: overallScore,
      visualScore: visualScore,
      jsScore: jsScore,
      correctnessScore: correctnessScore,
      jsEvaluation: jsEvaluation,
      outputImage: `${req.protocol}://${req.get('host')}${savedImagePath}`,
      submittedAt: submission.submittedAt
    };
  } catch (error) {
    console.error('Error processing submission:', error);
    throw error;
  }
};



// Then modify your POST route handler to use this function:
router.post('/', async (req, res) => {
  try {
    const result = await processSubmissionWithStages(req, res);
    res.status(201).json(result);
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