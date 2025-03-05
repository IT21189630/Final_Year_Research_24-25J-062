const express = require("express");
const router = express.Router();

const{
    saveSnippet,
    readSnippet,
    displaySnippet,
    updateSnippet,
    getSnippetsByUserId,
    deleteSnippet,
    addCollaborator
} = require("../controllerls/codeSnippet.controller");

router.post('/save-snippet', saveSnippet);
router.get('/read-snippet/:id', readSnippet);
router.get('/display-snippets', displaySnippet);
router.put('/update-snippet/:id', updateSnippet);
router.get('/get-user-snippet/:user_id', getSnippetsByUserId);
router.delete('/delete-snippet/:id', deleteSnippet);
router.post('/:snippetId/add-collaborator', addCollaborator);

module.exports = router;
