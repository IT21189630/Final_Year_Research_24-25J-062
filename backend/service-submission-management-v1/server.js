require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/connectDb");
const dailyChallengeRoutes = require('./routes/dailyChallengeRoutes');
const dailySubmissionRoutes = require('./routes/dailySubmissionRoutes');

connectDB();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));  // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/dailychallenge', dailyChallengeRoutes);
app.use('/api/dailysubmission', dailySubmissionRoutes);

app.get("/gamified-learning/api/submission-management", (req, res) => {
  res.send("submission managers service responded");
});

let serverPromise = new Promise((resolve, reject) => {
  mongoose.connection.once("open", () => {
    console.log(`🚀 data connection with users collection established! 🚀`);
    const server = app.listen(PORT, () => {
      console.log(
        `👦 Submission management service is up and running on port: ${PORT} 👦`
      );
      resolve(server);
    });
  });
});

module.exports = { app, serverPromise };