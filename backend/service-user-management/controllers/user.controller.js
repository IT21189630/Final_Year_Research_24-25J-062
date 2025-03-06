const studentModel = require("../models/student.model");
const adminModel = require("../models/admin.model");


// Get user by email
const getUserByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    let foundUser = await studentModel.findOne({ email }).exec();

    if (!foundUser) {
      foundUser = await adminModel.findOne({ email }).exec();
    }

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user_id: foundUser._id, email: foundUser.email });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addCollaboratedSnippet = async (req, res) => {
    try {
      const { userId } = req.params;
      const { snippetId } = req.body;
  
      const user = await studentModel.findByIdAndUpdate(
        userId,
        { $addToSet: { collaboratedSnippets: snippetId } }, // Prevent duplicates
        { new: true }
      ).select('collaboratedSnippets');
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json(user);
    } catch (error) {
      console.error("Error updating collaborated snippets:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  const getCollaboratedSnippets = async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // First check student model
      let user = await studentModel.findById(userId)
        .select('collaboratedSnippets')
        .lean();
  
      // If not found in student model, check admin model
      if (!user) {
        user = await adminModel.findById(userId)
          .select('collaboratedSnippets')
          .lean();
      }
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Return empty array if no collaborated snippets exist
      const snippets = user.collaboratedSnippets || [];
      res.status(200).json(snippets);
  
    } catch (error) {
      console.error("Error fetching collaborated snippets:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

module.exports = { getUserByEmail, addCollaboratedSnippet, getCollaboratedSnippets };
