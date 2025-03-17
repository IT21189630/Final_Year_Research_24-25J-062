const express = require('express');
const router = express.Router();
const DailyChallenge = require('../models/DailyChallenge');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Create a new daily challenge
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { date, title, description, jscode } = req.body;
    
    if (!date || !title || !description || !req.file) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    const dailyChallenge = new DailyChallenge({
      date,
      title,
      description,
      jscode,
      imageUrl
    });

    await dailyChallenge.save();
    res.status(201).json(dailyChallenge);
  } catch (error) {
    console.error('Error creating daily challenge:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get today's challenge
router.get('/today', async (req, res) => {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find a challenge with today's date
    const challenge = await DailyChallenge.findOne({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    if (!challenge) {
      // If no challenge exists for today, get the most recent one
      const mostRecent = await DailyChallenge.findOne().sort({ date: -1 });
      
      if (!mostRecent) {
        return res.status(404).json({ message: 'No challenges found' });
      }
      
      return res.json(mostRecent);
    }
    
    res.json(challenge);
  } catch (error) {
    console.error('Error fetching today\'s challenge:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all daily challenges
router.get('/', async (req, res) => {
  try {
    const challenges = await DailyChallenge.find().sort({ date: -1 });
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching daily challenges:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific daily challenge by ID
router.get('/:id', async (req, res) => {
  try {
    const challenge = await DailyChallenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    res.json(challenge);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;