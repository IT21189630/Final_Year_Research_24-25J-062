const express = require("express");
const { getUserByEmail , addCollaboratedSnippet , getCollaboratedSnippets } = require("../controllers/user.controller");

const router = express.Router();

router.get("/users/email/:email", getUserByEmail);
router.put('/users/:userId/add-snippet', addCollaboratedSnippet);
router.get('/:userId/collaborated-snippets', getCollaboratedSnippets);

module.exports = router;
