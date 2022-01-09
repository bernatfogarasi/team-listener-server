const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    username: { type: String, required: true, min: 6, max: 20 },
    email: { type: String, min: 6, max: 256, unique: true },
    profilePicture: {
      data: { type: Buffer },
      contentType: { type: String },
      url: { type: String },
    },
    emailConfirmed: { type: Boolean, default: false },
    emailConfirmationToken: {
      type: String,
    },
    spotifyId: { type: String },
    googleId: { type: String },
    password: { type: String, min: 10, max: 256 },
    createdAtTimestamp: { type: Number, default: Date.now },
    spotifyRefreshToken: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", schema);
