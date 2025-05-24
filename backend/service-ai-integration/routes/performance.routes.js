const express = require("express");
const router = express.Router();
const { updatePerformance } = require("../controllers/performance.controller");

// Route to update user performance
router.post("/update-performance", updatePerformance);

module.exports = router;
