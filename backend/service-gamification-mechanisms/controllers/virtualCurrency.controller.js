const VirtualCurrency = require("../models/virtualCurrency.model");

const updateCurrency = async (req, res) => {
  const { userId, amount, description } = req.body;

  if (!userId || amount === undefined || !description) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    let currency = await VirtualCurrency.findOne({ userId });

    if (!currency) {
      currency = new VirtualCurrency({ userId, balance: 0, transactions: [] });
    }

    // Update balance and add transaction
    currency.balance += amount;
    currency.transactions.push({ amount, description });

    await currency.save();
    res.status(200).json({ success: true, currency });
  } catch (error) {
    console.error("Error updating virtual currency:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { updateCurrency };
