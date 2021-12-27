require("dotenv").config();
const path = require("path");
const router = require("express").Router();
const Room = require(path.resolve("models/Room"));
const User = require(path.resolve("models/User"));
const authenticate = require(path.resolve("middleware/authenticate"));
const { requestRoomValidation } = require(path.resolve("validation"));

router.post("/", authenticate, async (request, response) => {
  const { shortId } = request.body;
  const userId = request.session.userId;
  const { error } = requestRoomValidation(request.body);
  if (error)
    return response.status(400).send({
      message: "not valid",
      error: error.details[0].message,
    });

  var room = await Room.findOne({ shortId });
  if (!room) return response.status(404).send({ message: "room not found" });
  for (const user of room.requests) {
    if (user.userId === userId) {
      return response.status(400).send({ message: "already requested" });
    }
  }
  for (const user of room.members) {
    if (user.userId === userId) {
      return response.status(400).send({ message: "already a member" });
    }
  }

  const user = await User.findOne({ userId });
  room.requests.push({ userId, username: user.username });
  await room.save();
  response.send({ message: "success" });
  request.app.io.to(shortId).emit(
    "requests",
    room.requests.map(({ username, date }) => ({
      username,
      date,
    }))
  );
});

module.exports = router;
