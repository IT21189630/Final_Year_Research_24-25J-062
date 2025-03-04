const codeSnippetModel = require('../models/codeSnippet.model');
const asyncHandler = require('express-async-handler');

// create a product
const saveSnippet = asyncHandler(async (req, res) => {
    const { user_id, htmlCode, cssCode, jsCode, codeName } = req.body;
  
    const response = await codeSnippetModel.create({
      user_id,
      htmlCode,
      cssCode,
      jsCode,
      codeName
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
})



module.exports = {
    saveSnippet,
    readSnippet,
    displaySnippet,
    updateSnippet,
    getSnippetsByUserId,
    deleteSnippet
};
