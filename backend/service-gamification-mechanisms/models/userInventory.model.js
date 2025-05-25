const mongoose = require("mongoose");

const userInventorySchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
			unique: true,
		},
		jsLessonHints: {
			type: Number,
			default: 0,
		},
		// Future items can be added here
		// xpBoosters: [{
		//   multiplier: Number,
		//   expiresAt: Date
		// }],
		// customThemes: [String],
		// exclusiveAvatars: [String]
	},
	{
		timestamps: true,
	}
);

// Method to add hints
userInventorySchema.methods.addHints = function (amount) {
	this.jsLessonHints += amount;
	return this.save();
};

// Method to use hints (for future implementation)
userInventorySchema.methods.useHints = function (amount) {
	if (this.jsLessonHints >= amount) {
		this.jsLessonHints -= amount;
		return this.save();
	}
	throw new Error("Not enough hints available");
};

const UserInventory = mongoose.model("UserInventory", userInventorySchema);

module.exports = UserInventory;
