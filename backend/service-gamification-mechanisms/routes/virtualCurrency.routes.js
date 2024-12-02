const express = require("express");
const router = express.Router();
const { updateCurrency } = require("../controllers/virtualCurrency.controller");

// Endpoint: Update virtual currency balance
router.post("/update-currency", updateCurrency);

module.exports = router;
