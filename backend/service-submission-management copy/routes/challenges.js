const express = require('express');
const router = express.Router();
// const { auth } = require('../middleware/auth');
const challengeController = require('../controllers/challengeController');
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/references'));
  },
  filename: (req, file, cb) => {
    cb(null, `reference_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// Routes
router.post('/', upload.single('referenceImage'), challengeController.createChallenge);
router.get('/', challengeController.getAllChallenges);
router.get('/:id', challengeController.getChallengeById);

module.exports = router;