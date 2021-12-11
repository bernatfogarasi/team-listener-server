require("dotenv").config();
const path = require("path");
const router = require("express").Router();
const Room = require(path.resolve("models/Room"));
const authenticate = require(path.resolve("middleware/authenticate"));
const { requestRoomValidation } = require(path.resolve("validation"));

router.post("/", authenticate, async (request, response) => {
  const { userId, shortId } = request.body;
  const { error } = requestRoomValidation(request.body);
  if (error)
    return response.status(400).send({
      message: "Join request is not valid.",
      error: error.details[0].message,
    });

  var room = await Room.findOne({ shortId });
  if (!room) return response.status(404).send("Room not found.");
  for (const user of room.requests) {
    if (user.userId === userId) {
      return response.status(400).send("Already requested to join.");
    }
  }
  for (const user of room.members) {
    if (user.userId === userId) {
      return response.status(400).send("Already a member.");
    }
  }
  room.requests.push({ userId });
});

module.exports = router;
