const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, min: 1, max: 30 },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    shortId: { type: String, required: true },
    url: { type: String, required: true },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        active: { type: Boolean, default: false },
      },
    ],
    requests: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        date: { type: Date, default: Date.now() },
      },
    ],
    playing: { type: Boolean, default: false },
    progress: { type: Number, default: 0 },
    current: {
      id: { type: String },
      site: { type: String },
      title: { type: String },
      author: { type: String },
      duration: { type: Number },
      url: { type: String },
      thumbnailUrl: { type: String },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    queue: [
      {
        id: { type: String, required: true },
        site: { type: String, enum: ["youtube", "spotify"], required: true },
        title: { type: String, required: true },
        author: { type: String, required: true },
        duration: { type: Number, required: true },
        url: { type: String },
        thumbnailUrl: { type: String },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    // password: { type: String, required: true, min: 10, max: 255 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", schema);
