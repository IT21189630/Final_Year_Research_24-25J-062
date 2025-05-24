const Challenge = require('../models/Challenge');
const path = require('path');
const fs = require('fs');

exports.createChallenge = async (req, res) => {
  try {
    const { title, description, difficulty } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Reference image is required' });
    }
    
    const referenceImagePath = req.file.path;
    
    const challenge = new Challenge({
      title,
      description,
      referenceImagePath,
      difficulty
    });
    
    await challenge.save();
    
    res.status(201).json({ 
      success: true, 
      data: challenge 
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: challenges.length,
      data: challenges
    });
  } catch (error) {
    console.error('Error getting challenges:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        message: 'Challenge not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: challenge
    });
  } catch (error) {
    console.error('Error getting challenge:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};