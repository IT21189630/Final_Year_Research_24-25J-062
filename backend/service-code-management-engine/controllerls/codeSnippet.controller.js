const codeSnippetModel = require('../models/codeSnippet.model');
const asyncHandler = require('express-async-handler');
const axios = require("axios");

const USER_SERVICE_URL = "http://localhost:4000/gamified-learning/api/user-management/auth";

// create a product
const saveSnippet = asyncHandler(async (req, res) => {
    const { user_id, htmlCode, cssCode, jsCode, codeName } = req.body;
  
    const response = await codeSnippetModel.create({
      user_id,
      htmlCode,
      cssCode,
      jsCode,
      codeName,
      allowedUsers: [user_id] 
    });
  
    if (response) {
      res.status(200).json("Code saved successfully");
    } else {
      res.status(401).json("Code save failed");
    }
  });

  // read a code
const readSnippet = asyncHandler(async (req, res) => {
    const id = req.params.id;
  
    try {
      const response = await codeSnippetModel.findById(id);
  
      if (response) {
        res.status(200).json(response);
      } else {
        res.status(404).json({ message: 'Code not found' }); // Updated status and response
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' }); // Handle server error
    }
  });

  // read all available snipets
const displaySnippet = asyncHandler(async(req,res)=>{
    const response = await codeSnippetModel.find()

    if(response){
        res.status(200).json(response)
    }
    else{
        res.status(401).json('something went wrong!')
    }
})

// update snipet details
const updateSnippet = asyncHandler(async(req,res)=>{
    const id = req.params.id 
    
    // check whether the product is existing for update process
    const checkInstance = await codeSnippetModel.findById(id)

    if(checkInstance){
        const response = await codeSnippetModel.findByIdAndUpdate(id , {...req.body})
        if(response){
            res.status(200).json(response)
        }
        else{
            res.status(403).json('snippet can not be updated')
        }
    }
    else{
        res.status(404).json('snippet does not exist in the database')
    }
})

// Get snippet IDs and codeNames by user ID
const getSnippetsByUserId = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    try {
        // Retrieve _id and codeName fields
        const snippets = await codeSnippetModel.find({ user_id }, '_id codeName'); 
        
        if (snippets.length > 0) {
            // Format the response to include both id and codeName
            const response = snippets.map(snippet => ({
                id: snippet._id,
                codeName: snippet.codeName,
            }));
            res.status(200).json(response);
        } else {
            res.status(404).json({ message: 'No snippets found for this user' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// delete a snippet
const deleteSnippet = asyncHandler(async(req,res)=>{
    const id = req.params.id 
    const response = await codeSnippetModel.findByIdAndDelete(id)
    if(response){
        res.status(202).json(response)
    }
    else{
        res.status(400).json({error: 'record deleted'})
    }
});

// Add a collaborator to a snippet
const addCollaborator = asyncHandler(async (req, res) => {
    const { snippetId } = req.params;
    const { email } = req.body;
  
    try {
      // 1. Get user details from User Service
      const userResponse = await axios.get(`${USER_SERVICE_URL}/users/email/${email}`);
      if (!userResponse.data) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { user_id: collaboratorId } = userResponse.data;
  
      // 2. Check and update code snippet
      const snippet = await codeSnippetModel.findById(snippetId);
      if (!snippet) return res.status(404).json({ message: "Snippet not found" });
  
      // 3. Update allowed users if needed
      if (!snippet.allowedUsers.includes(email)) {
        snippet.allowedUsers.push(email);
        await snippet.save();
      }
  
      // 4. Update user's collaborated snippets
      await axios.put(
        `${USER_SERVICE_URL}/users/${collaboratorId}/add-snippet`,
        { snippetId }
      );
  
      res.status(200).json({ 
        message: "Collaborator added successfully!",
        collaboratorId
      });
    } catch (error) {
      console.error("Error adding collaborator:", error);
      
      // Handle specific error cases
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || "Internal Server Error";
      
      res.status(status).json({ message });
    }
  });



module.exports = {
    saveSnippet,
    readSnippet,
    displaySnippet,
    updateSnippet,
    getSnippetsByUserId,
    deleteSnippet,
    addCollaborator
};
