const mongoose = require("mongoose");

const userExperienceSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
			unique: true,
		},
		totalXp: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

const UserExperience = mongoose.model("UserExperience", userExperienceSchema);

module.exports = UserExperience;
