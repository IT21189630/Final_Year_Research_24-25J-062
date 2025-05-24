const studentModel = require("../models/student.model");
const adminModel = require("../models/admin.model");

// Get user by ID
const getUserById = async (req, res) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ error: "User ID is required" });
	}

	try {
		// Try to find user in student model
		let user = await studentModel
			.findById(id)
			.select("-password -refresh_token");

		// If not found in student model, try admin model
		if (!user) {
			user = await adminModel
				.findById(id)
				.select("-password -refresh_token");
		}

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		return res.status(200).json(user);
	} catch (error) {
		console.error("Error fetching user:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

module.exports = { getUserById };
