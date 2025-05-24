const express = require("express");
const router = express.Router();
const { getUserById } = require("../controllers/user.controller");

// Get user by ID
router.get("/:id", getUserById);

module.exports = router;
