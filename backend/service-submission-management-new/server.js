require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/connectDb");
const path = require("path");

// Import routes
const challengeRoutes = require("./routes/challenge.routes");
const submissionRoutes = require("./routes/submission.routes");

connectDB();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// In server.js, before your routes
app.options('*', cors());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/reference-images', express.static(path.join(__dirname, 'reference-images')));
app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));

// Set up routes
app.use("/api/challenges", challengeRoutes);
app.use("/api/submissions", submissionRoutes);

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