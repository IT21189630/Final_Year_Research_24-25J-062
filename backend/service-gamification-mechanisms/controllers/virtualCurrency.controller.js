const UserWallet = require("../models/virtualCurrency.model");
const UserExperience = require("../models/userExperience.model");

// Conversion rates
const CONVERSION_RATES = [
	{ xp: 100, coins: 1, name: "Basic" },
	{ xp: 500, coins: 8, name: "Standard" },
	{ xp: 1000, coins: 20, name: "Premium" },
	{ xp: 5000, coins: 120, name: "Ultimate" },
];

// Get conversion rates
const getConversionRates = async (req, res) => {
	try {
		return res.status(200).json({
			success: true,
			conversionRates: CONVERSION_RATES,
		});
	} catch (error) {
		console.error("Error fetching conversion rates:", error);
		return res
			.status(500)
			.json({ success: false, error: "Internal server error." });
	}
};

// Get user wallet
const getUserWallet = async (req, res) => {
	const { userId } = req.params;

	if (!userId) {
		return res
			.status(400)
			.json({ success: false, error: "User ID is required" });
	}

	try {
		let wallet = await UserWallet.findOne({ userId });

		if (!wallet) {
			wallet = new UserWallet({
				userId,
				coinBalance: 0,
				transactions: [],
			});
			await wallet.save();
		}

		const userExperience = await UserExperience.findOne({ userId });
		const totalXp = userExperience ? userExperience.totalXp : 0;

		return res.status(200).json({
			success: true,
			wallet,
			totalXp,
		});
	} catch (error) {
		console.error("Error fetching user wallet:", error);
		return res
			.status(500)
			.json({ success: false, error: "Internal server error." });
	}
};

// Convert XP to coins
const convertXpToCoins = async (req, res) => {
	const { userId, xpAmount } = req.body;

	if (!userId || !xpAmount) {
		return res
			.status(400)
			.json({
				success: false,
				error: "User ID and XP amount are required",
			});
	}

	try {
		// Get user experience
		const userExperience = await UserExperience.findOne({ userId });
		if (!userExperience) {
			return res
				.status(404)
				.json({
					success: false,
					error: "User experience record not found",
				});
		}

		// Check if user has enough XP
		if (userExperience.totalXp < xpAmount) {
			return res
				.status(400)
				.json({ success: false, error: "Insufficient XP balance" });
		}

		// Find the appropriate conversion rate
		let selectedRate = null;
		for (const rate of CONVERSION_RATES) {
			if (xpAmount >= rate.xp) {
				selectedRate = rate;
			}
		}

		if (!selectedRate) {
			return res.status(400).json({
				success: false,
				error: `Minimum XP required for conversion is ${CONVERSION_RATES[0].xp}`,
			});
		}

		// Calculate coins to award
		let coinsToAward = 0;

		// Find the best rate that applies to this amount
		for (let i = CONVERSION_RATES.length - 1; i >= 0; i--) {
			const rate = CONVERSION_RATES[i];
			if (xpAmount >= rate.xp) {
				coinsToAward = Math.floor(xpAmount / rate.xp) * rate.coins;
				selectedRate = rate;
				break;
			}
		}

		// Update user wallet
		let wallet = await UserWallet.findOne({ userId });
		if (!wallet) {
			wallet = new UserWallet({
				userId,
				coinBalance: 0,
				transactions: [],
			});
		}

		// Add transaction
		wallet.transactions.push({
			type: "CONVERT_XP",
			xpAmount: xpAmount,
			coinAmount: coinsToAward,
			conversionRate: `${selectedRate.xp} XP → ${selectedRate.coins} Coins (${selectedRate.name})`,
			description: `Converted ${xpAmount} XP to ${coinsToAward} Coins at ${selectedRate.name} rate`,
		});

		wallet.coinBalance += coinsToAward;
		await wallet.save();

		// Deduct XP from user
		userExperience.totalXp -= xpAmount;
		await userExperience.save();

		return res.status(200).json({
			success: true,
			wallet,
			conversion: {
				xpAmount,
				coinsAwarded: coinsToAward,
				rate: selectedRate,
			},
		});
	} catch (error) {
		console.error("Error converting XP to coins:", error);
		return res
			.status(500)
			.json({ success: false, error: "Internal server error." });
	}
};

// Legacy function for backward compatibility
const updateCurrency = async (req, res) => {
	const { userId, amount, description } = req.body;

	if (!userId || amount === undefined || !description) {
		return res.status(400).json({ error: "Missing required fields." });
	}

	try {
		let wallet = await UserWallet.findOne({ userId });

		if (!wallet) {
			wallet = new UserWallet({
				userId,
				coinBalance: 0,
				transactions: [],
			});
		}

		// Update balance and add transaction
		wallet.coinBalance += amount;
		wallet.transactions.push({
			type: "REWARD",
			coinAmount: amount,
			description,
		});

		await wallet.save();
		res.status(200).json({ success: true, wallet });
	} catch (error) {
		console.error("Error updating wallet:", error);
		res.status(500).json({ error: "Internal server error." });
	}
};

module.exports = {
	getUserWallet,
	convertXpToCoins,
	getConversionRates,
	updateCurrency,
};
