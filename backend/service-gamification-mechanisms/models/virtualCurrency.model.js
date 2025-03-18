const mongoose = require("mongoose");

const userWalletSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
			unique: true,
		},
		coinBalance: {
			type: Number,
			default: 0,
		},
		transactions: [
			{
				type: {
					type: String,
					enum: ["CONVERT_XP", "PURCHASE", "REWARD"],
					required: true,
				},
				xpAmount: Number,
				coinAmount: Number,
				conversionRate: String,
				description: String,
				timestamp: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

const UserWallet = mongoose.model("UserWallet", userWalletSchema);

module.exports = UserWallet;
