require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require("./middlewares/errorMiddleware");
const connectDB = require("./config/connectDb");
const verifyJWT = require("./middlewares/verifyJWTMiddleware");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const achievementRoutes = require("./routes/achievement.routes");
const virtualCurrencyRoutes = require("./routes/virtualCurrency.routes");

connectDB();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/gamified-learning/api/gamification", leaderboardRoutes);
app.use("/gamified-learning/api/gamification", achievementRoutes);
app.use("/gamified-learning/api/gamification", virtualCurrencyRoutes);

app.use(verifyJWT);
app.use(errorHandler);

let serverPromise = new Promise((resolve, reject) => {
  mongoose.connection.once("open", () => {
    console.log(`🚀 data connection with users collection established! 🚀`);
    const server = app.listen(PORT, () => {
      console.log(
        `🤖 AI integration service is up and running on port: ${PORT} 🤖`
      );
      resolve(server);
    });
  });
});

module.exports = { app, serverPromise };
