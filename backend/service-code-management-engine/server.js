require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const errorHandler = require("./middlewares/errorMiddleware");
const connectDB = require("./config/connectDb");
const http = require("http"); // Required for WebSockets
const { Server } = require("socket.io");
const CodeSnippet = require("./models/codeSnippet.model"); // ✅ FIXED: Import CodeSnippet model

connectDB();
const app = express();
const PORT = process.env.PORT || 4010;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(errorHandler);
app.use("/virtual-lab", require("./routes/codeSnippet.route"));

// Create an HTTP server and wrap Express
const server = http.createServer(app);

// Initialize WebSocket Server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST"],
  },
});

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log(`🔗 User connected: ${socket.id}`);

  // User joins a coding lab using the Code Snippet ID as roomId
  socket.on("joinRoom", async (roomId) => {
    try {
      // Fetch code snippet from MongoDB
      const snippet = await CodeSnippet.findById(roomId);
      if (!snippet) {
        console.log(`🚨 Snippet not found: ${roomId}`);
        socket.emit("error", { message: "Snippet not found!" });
        return;
      }

      // Join the socket room
      socket.join(roomId);
      console.log(`📌 User ${socket.id} joined lab: ${roomId}`);

      // Send initial code to the user
      socket.emit("initialCode", {
        htmlCode: snippet.htmlCode || "",
        cssCode: snippet.cssCode || "",
        jsCode: snippet.jsCode || "",
      });
    } catch (error) {
      console.error("❌ Error fetching code snippet:", error);
      socket.emit("error", { message: "Server error. Try again later!" });
    }
  });

  // Handle real-time code updates
  socket.on("codeUpdate", async ({ roomId, type, content }) => {
    try {
      const validTypes = ["htmlCode", "cssCode", "jsCode"];
      if (!validTypes.includes(type)) {
        console.log(`🚨 Invalid update type: ${type}`);
        return;
      }

      // Update MongoDB document only for the specified field
      await CodeSnippet.findByIdAndUpdate(roomId, { $set: { [type]: content } });

      // Broadcast update to other users in the same room
      socket.to(roomId).emit("codeUpdate", { type, content });
    } catch (error) {
      console.error("❌ Error updating code snippet:", error);
      socket.emit("error", { message: "Failed to update code!" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// ✅ FIXED: Start the server properly
server.listen(PORT, () => {
  console.log('🚀 data connection with code engine established! 🚀');
  console.log(`🚀 Code management service is up and running on port: ${PORT}`);
});

module.exports = { app, server };
