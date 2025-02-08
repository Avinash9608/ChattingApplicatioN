require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectDB = require("./db");
const User = require("./models/User");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500", // Change if needed
    methods: ["GET", "POST"],
  },
});

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(express.static("public"));

// Signup Route
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });

    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      username: user.username,
      email: user.email,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WebSocket Connection
io.on("connection", async (socket) => {
  console.log("A user connected");

  const messages = await Message.find().sort({ timestamp: 1 });
  socket.emit("previousMessages", messages);

  socket.on("join", (email) => {
    socket.email = email;
    io.emit("message", {
      email: "System",
      message: `${email} has joined the chat`,
    });
  });

  socket.on("message", async (data) => {
    if (!socket.email) return;

    const newMessage = new Message({
      email: socket.email,
      message: data.message,
    });
    await newMessage.save();
    io.emit("message", { email: socket.email, message: data.message });
  });

  socket.on("disconnect", () => {
    if (socket.email) {
      io.emit("message", {
        email: "System",
        message: `${socket.email} has left the chat`,
      });
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5500;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
