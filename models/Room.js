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
      },
    ],
    active: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    requests: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        date: { type: Date, default: Date.now },
      },
    ],
    seconds: { type: Number, default: 0 },
    playing: { type: Boolean, default: false },
    playing: { type: Boolean, default: false },
    current: {
      id: { type: String, default: null },
      site: { type: String, default: null },
      title: { type: String, default: null },
      author: { type: String, default: null },
      url: { type: String, default: null },
      thumbnailUrl: { type: String, default: null },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    queue: [
      {
        id: { type: String, required: true },
        site: { type: String, enum: ["youtube", "spotify"], required: true },
        title: { type: String, required: true },
        author: { type: String, required: true },
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
