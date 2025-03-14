const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  refImage: { type: String, required: true }
});

module.exports = mongoose.model("Challenge", challengeSchema);
