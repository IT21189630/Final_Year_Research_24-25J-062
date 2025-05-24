const express = require('express');
const router = express.Router();
const { 
  submitChallenge,
  getUserSubmissions
} = require('../controllers/submission.controller');
const { verifyToken } = require('../middleware/auth');

// Submit a challenge solution
router.post('/', verifyToken, submitChallenge);

// Get user's submissions
router.get('/my-submissions', verifyToken, getUserSubmissions);

module.exports = router;