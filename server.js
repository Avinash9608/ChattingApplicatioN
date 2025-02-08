require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectDB = require("./db");
const path = require("path"); // Import path module

const User = require("./models/User");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Or specify your allowed origins for production
    methods: ["GET", "POST"],
  },
});

connectDB();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files FIRST

// Signup Route
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });

    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

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
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// WebSocket Connection
io.on("connection", async (socket) => {
  console.log("A user connected");

  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    socket.emit("previousMessages", messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
  }

  socket.on("join", (email) => {
    socket.email = email;
    io.emit("message", {
      email: "System",
      message: `${email} has joined the chat`,
    });
  });

  socket.on("message", async (data) => {
    if (!socket.email) return;

    try {
      const newMessage = new Message({
        email: socket.email,
        message: data.message,
      });
      await newMessage.save();
      io.emit("message", { email: socket.email, message: data.message });
    } catch (err) {
      console.error("Error saving message:", err);
    }
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
// const PORT = process.env.PORT || 5500;
// server.listen(PORT, async () => {
//   console.log(`Server is running on http://localhost:${PORT}`);

//   // Open frontend in browser dynamically
//   try {
//     const open = (await import("open")).default;
//     await open("http://localhost:5500/index.html");
//     console.log("Frontend opened in browser");
//   } catch (err) {
//     console.error("Error opening browser:", err);
//   }
// });
const PORT = process.env.PORT || 5500;
server.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  try {
    const open = (await import("open")).default;
    await open(`http://localhost:${PORT}`); // Open without index.html
    console.log("Frontend opened in browser");
  } catch (err) {
    console.error("Error opening browser:", err);
  }
});
