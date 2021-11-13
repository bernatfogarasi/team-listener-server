const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, min: 10 },
    memberIds: { type: Array, required: false, max: 100 },
    name: { type: String, required: true, min: 4 },
    password: { type: String, required: true, min: 10, max: 255 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
