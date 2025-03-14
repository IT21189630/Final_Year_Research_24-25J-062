const express = require('express');
const router = express.Router();
const { 
  upload,
  createDailyChallenge, 
  getCurrentChallenge,
  getAllChallenges,
  getChallengeById
} = require('../controllers/challenge.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Create a new daily challenge (admin only)
router.post(
  '/', 
  // verifyToken, 
  // isAdmin, 
  upload.single('referenceImage'), 
  createDailyChallenge
);

// Get current active challenge
router.get('/current', verifyToken, getCurrentChallenge);

// Get all challenges (admin only)
router.get('/', verifyToken, isAdmin, getAllChallenges);

// Get challenge by ID
router.get('/:id', verifyToken, getChallengeById);

module.exports = router;