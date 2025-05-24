const express = require("express");
const router = express.Router();
const { getAdvancedFeedback } = require("../controllers/feedback.controller");

// Route to enhanced feedback for code
router.post("/advanced-feedback", getAdvancedFeedback);

module.exports = router;
