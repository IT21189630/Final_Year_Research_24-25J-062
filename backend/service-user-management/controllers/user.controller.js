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

module.exports = { getUserByEmail };
