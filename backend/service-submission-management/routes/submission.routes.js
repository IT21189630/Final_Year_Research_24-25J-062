const express = require('express');
const router = express.Router();
const { submitHtmlCss } = require('../controllers/submission.controller');

router.post('/submit-html-css', submitHtmlCss);
module.exports = router;

