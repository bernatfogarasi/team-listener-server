const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, min: 6, max: 20 },
    email: { type: String, required: true, min: 6, max: 256 },
    emailConfirmed: { type: Boolean, default: false },
    password: { type: String, required: true, min: 10, max: 256 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
