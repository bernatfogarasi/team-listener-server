const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    username: { type: String, required: true, min: 6, max: 20 },
    email: { type: String, min: 6, max: 256, unique: true },
    emailConfirmed: { type: Boolean, default: false },
    emailConfirmationToken: { type: String, unique: true },
    password: { type: String, min: 10, max: 256 },
    googleId: { type: String, unique: true },
    googleEmail: { type: String, min: 6, max: 256 },
    spotifyId: { type: String, unique: true },
    spotifyEmail: { type: String, min: 6, max: 256 },
    spotifyRefreshToken: { type: String },
    profilePicture: {
      data: { type: Buffer },
      contentType: { type: String },
      url: { type: String },
    },
    createdAtTimestamp: { type: Number, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", schema);
