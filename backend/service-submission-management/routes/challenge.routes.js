const express = require("express");
const { getTasks, getTaskById } = require("../controllers/challenge.controller");

const router = express.Router();

// Route to fetch all tasks
router.get("", getTasks);

// Route to fetch a task by ID
router.get("/:id", getTaskById);

module.exports = router;
