const express = require('express');
const router = express.Router();
// const { auth } = require('../middleware/auth');
const submissionController = require('../controllers/submissionController');

router.post('/', submissionController.createSubmission);
router.get('/user', submissionController.getUserSubmissions);

module.exports = router;

// middleware/auth.js
const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  // Get token from header
  const token = req.cookies.token || req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};