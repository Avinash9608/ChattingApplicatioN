const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  email: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
