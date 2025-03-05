const express = require("express");
const { getUserByEmail } = require("../controllers/user.controller");

const router = express.Router();

router.get("/users/email/:email", getUserByEmail);

module.exports = router;
