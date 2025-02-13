require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const connectDB = require("./db");
const User = require("./models/User");
const Message = require("./models/Message");
const axios = require("axios");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

connectDB();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

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
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// File Upload Route
app.post("/upload", upload.single("file"), (req, res) => {
  console.log("File uploaded:", req.file);

  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;

  // Emit the file event to all connected clients
  io.emit("file", {
    email: "Anonymous",
    fileName: req.file.originalname,
    fileUrl: fileUrl,
  });

  res.status(200).json({ fileUrl, fileName: req.file.originalname });
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

  // Handle file message
  socket.on("file", (data) => {
    io.emit("file", data);
  });

  socket.on("chatbot_request", async (message) => {
    try {
      const response = await axios.post(
        "https://chatbot-73nn.onrender.com/chat",
        { message }
      );

      // ✅ Extract the actual message
      io.emit("chatbot_response", { response: response.data.response });
    } catch (error) {
      console.error(
        "Chatbot API error:",
        error.response?.data || error.message
      );

      io.emit("chatbot_response", {
        response: "Sorry, I’m unavailable right now. Please try again later.",
      });
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

const userSocketMapping = {}; // Stores email-to-socket ID mapping

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // Register user with email
  socket.on("register-user", ({ email }) => {
    if (!email) {
      console.log("⚠️ Attempted to register with an undefined email.");
      return;
    }

    userSocketMapping[email] = socket.id;
    console.log(`✅ User Registered: ${email} -> ${socket.id}`);
    console.log("📢 Current Users:", userSocketMapping);
  });

  // Handle call request
  socket.on("call-user", ({ recipientEmail, callerEmail }) => {
    const recipientSocket = userSocketMapping[recipientEmail];
    if (recipientSocket) {
      io.to(recipientSocket).emit("incoming-call", { callerEmail });
    } else {
      socket.emit("user-not-available", { recipientEmail });
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
    for (const email in userSocketMapping) {
      if (userSocketMapping[email] === socket.id) {
        delete userSocketMapping[email];
        break;
      }
    }
    console.log("📢 Current Users after Disconnect:", userSocketMapping);
  });
});

// Function to get user socket by email
function getUserSocketByEmail(email) {
  return userSocketMapping[email] || null;
}
const onlineUsers = new Set();

io.on("connection", (socket) => {
  socket.on("join", (email) => {
    onlineUsers.add(email);
    io.emit("online-users", Array.from(onlineUsers));
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.email);
    io.emit("online-users", Array.from(onlineUsers));
  });

  socket.on("call-user", (data) => {
    const { recipientEmail, callerEmail } = data;
    if (onlineUsers.has(recipientEmail)) {
      io.to(recipientEmail).emit("incoming-call", { callerEmail });
    } else {
      socket.emit("user-not-available", { recipientEmail });
    }
  });
});

const PORT = process.env.PORT || 5500;
server.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  try {
    const open = (await import("open")).default;
    await open(`http://localhost:${PORT}`);
    console.log("Frontend opened in browser");
  } catch (err) {
    console.error("Error opening browser:", err);
  }
});
