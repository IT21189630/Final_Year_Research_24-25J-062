const mongoose = require("mongoose");

const virtualCurrencySchema = new mongoose.Schema(
  {
    userId: { 
        type: String, 
        required: true 
    },
    balance: { 
        type: Number, 
        default: 0 
    },
    transactions: [
      {
        amount: Number,
        description: String,
        timestamp: { 
            type: Date, 
            default: Date.now 
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const VirtualCurrency = mongoose.model("VirtualCurrency", virtualCurrencySchema);

module.exports = VirtualCurrency;
