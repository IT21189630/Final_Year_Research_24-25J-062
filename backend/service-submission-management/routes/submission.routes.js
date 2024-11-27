const express = require('express');
const router = express.Router();
const { storeSubmission } = require('../controllers/evaluationController');

router.post('/submit-html-css', storeSubmission);
module.exports = router;

