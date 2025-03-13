const mongoose = require("mongoose");

const errorLogSchema = new mongoose.Schema({
    userID: { type: String, required: true },
    errorLogs: [
        {
            timestamp: { type: Date, default: Date.now },
            errorType: { type: String, required: true },
            fileType: { type: String, enum: ["HTML", "CSS", "JavaScript"], required: true }
        }
    ],
    lastUpdated: { type: Date, default: Date.now }
});

const ErrorLog = mongoose.model("ErrorLog", errorLogSchema);
module.exports = ErrorLog;
