const DailyChallenge = require('../models/dailyChallenge.model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage for reference images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'reference-images/');
  },
  filename: function(req, file, cb) {
    cb(null, 'challenge-' + Date.now() + path.extname(file.originalname));
  }
});

// Filter for image files only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image file.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Create a new daily challenge
const createDailyChallenge = async (req, res) => {
  try {
    const { title, description, difficultyLevel } = req.body;
    
    // Check if there's already an active challenge
    const activeChallenge = await DailyChallenge.findOne({ isActive: true });
    if (activeChallenge) {
      // Set the previous active challenge to inactive
      activeChallenge.isActive = false;
      await activeChallenge.save();
    }
    
    // Create new challenge
    const newChallenge = new DailyChallenge({
      title,
      description,
      referenceImage: req.file.path,
      difficultyLevel: difficultyLevel || 'beginner',
      //createdBy: req.user.id, // Assuming user info is available from auth middleware
      isActive: true
    });
    
    await newChallenge.save();
    
    res.status(201).json({
      success: true,
      message: 'Daily challenge created successfully',
      challenge: newChallenge
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to create daily challenge',
      error: error.message
    });
  }
};

// Get the current active daily challenge
const getCurrentChallenge = async (req, res) => {
  try {
    const challenge = await DailyChallenge.findOne({ isActive: true });
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'No active challenge found'
      });
    }
    
    res.status(200).json({
      success: true,
      challenge
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve daily challenge',
      error: error.message
    });
  }
};

// Get all daily challenges (for admin)
const getAllChallenges = async (req, res) => {
  try {
    const challenges = await DailyChallenge.find()
      .sort({ createdAt: -1 })
      .select('title description difficultyLevel isActive createdAt');
    
    res.status(200).json({
      success: true,
      count: challenges.length,
      challenges
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve challenges',
      error: error.message
    });
  }
};

// Get a specific challenge by ID
const getChallengeById = async (req, res) => {
  try {
    const challenge = await DailyChallenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }
    
    res.status(200).json({
      success: true,
      challenge
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve challenge',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  createDailyChallenge,
  getCurrentChallenge,
  getAllChallenges,
  getChallengeById
};