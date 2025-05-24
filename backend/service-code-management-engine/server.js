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
app.use("/error-log", require("./routes/codeError.route"));
app.use("/code", require("./routes/recommendation.route"));

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
    console.log(`📌 User ${socket.id} attempting to join room: ${roomId}`);
  
    try {
      const snippet = await CodeSnippet.findById(roomId);
      if (!snippet) {
        console.log(`🚨 Snippet not found: ${roomId}`);
        socket.emit("error", { message: "Snippet not found!" });
        return;
      }
  
      socket.join(roomId);
      console.log(`✅ User ${socket.id} successfully joined room: ${roomId}`);
  
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
  console.log("🔥 Received code update event:", { roomId, type, content });

  const validTypes = ["htmlCode", "cssCode", "jsCode"];
  if (!validTypes.includes(type)) {
    console.log(`🚨 Invalid update type: ${type}`);
    return;
  }

  const snippet = await CodeSnippet.findById(roomId);
  console.log("🗄️ Snippet found?", snippet ? "✅ Yes" : "❌ No");

  if (!snippet) {
    socket.emit("error", { message: "Snippet not found!" });
    return;
  }

  await CodeSnippet.findByIdAndUpdate(roomId, { $set: { [type]: content } });

  console.log(`✅ MongoDB Updated: ${type} -`, content);
  socket.to(roomId).emit("codeUpdate", { type, content });
  console.log(`🔄 Broadcasted update to room: ${roomId}`);
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
