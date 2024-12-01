const express = require('express');
const router = express.Router();
const { submitCode, checkSimilarity } = require('../controllers/submission.controller');

//router.post('/submit', submitCode);
router.post("/check-similarity", checkSimilarity);
module.exports = router;

