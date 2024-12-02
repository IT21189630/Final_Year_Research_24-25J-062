const express = require("express");
const router = express.Router();
const { validateCode } = require("../controllers/code.controller");

// Route to validate user-submitted code
router.post("/validate-code", validateCode);

module.exports = router;
