const ErrorLog = require("../models/codeErrorLogs.model");

const addErrorLog = async (req, res) => {
    try {
        const { userID, errorLogs, lastUpdated } = req.body;

        if (!userID || !Array.isArray(errorLogs) || errorLogs.length === 0) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        // Add timestamps to missing entries
        errorLogs.forEach(log => {
            if (!log.timestamp) log.timestamp = new Date();
        });

        // Update or create a new user error log
        await ErrorLog.updateOne(
            { userID: userID },
            {
                $push: { errorLogs: { $each: errorLogs } },
                $set: { lastUpdated: lastUpdated || new Date() }
            },
            { upsert: true }
        );

        return res.status(201).json({ message: "Error logs added successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { addErrorLog };
