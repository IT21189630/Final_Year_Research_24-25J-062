const express = require('express');
const router = express.Router();
const { submitCode } = require('../controllers/submission.controller');

router.post('/submit', submitCode);
module.exports = router;

