const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, min: 6, max: 20, unique: true },
    email: { type: String, required: true, min: 6, max: 256, unique: true },
    emailConfirmed: { type: Boolean, default: false },
    emailConfirmationToken: {
      type: String,
      required: true,
    },
    password: { type: String, required: true, min: 10, max: 256 },
    createdAtTimestamp: { type: Number, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
