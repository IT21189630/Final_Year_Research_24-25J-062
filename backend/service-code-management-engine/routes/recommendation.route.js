const express = require("express");
const router = express.Router();
const { getRecommendation } = require('../controllerls/recommendationController');


// Define the route for AI-based recommendations
router.post('/recommendation', getRecommendation);

module.exports = router;
