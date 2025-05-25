const express = require("express");
const router = express.Router();
const {
	getUserWallet,
	getUserInventory,
	purchaseItem,
	convertXpToCoins,
	getConversionRates,
	updateCurrency,
} = require("../controllers/virtualCurrency.controller");

// Get conversion rates
router.get("/wallet/conversion-rates", getConversionRates);

// Get user wallet
router.get("/wallet/:userId", getUserWallet);

// Get user inventory
router.get("/inventory/:userId", getUserInventory);

// Purchase item from store
router.post("/store/purchase", purchaseItem);

// Convert XP to coins
router.post("/wallet/convert", convertXpToCoins);

// Legacy endpoint: Update virtual currency balance
router.post("/update-currency", updateCurrency);

module.exports = router;
