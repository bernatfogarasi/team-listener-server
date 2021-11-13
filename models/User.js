const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, min: 6, max: 20 },
    email: { type: String, required: true, min: 6, max: 256 },
    password: { type: String, required: true, min: 10, max: 256 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
