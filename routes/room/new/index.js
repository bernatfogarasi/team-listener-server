require("dotenv").config();
const path = require("path");
const crypto = require("crypto");
const router = require("express").Router();
const Room = require(path.resolve("models/Room"));
const { newRoomValidation } = require(path.resolve("validation"));
const authenticate = require(path.resolve("middleware/authenticate"));
const characters = require(path.resolve("functions/characters"));

router.post("/", authenticate, async (request, response) => {
  const { error } = newRoomValidation(request.body);
  if (error)
    return response.status(400).send({
      message: "New room is not valid.",
      error: error.details[0].message,
    });

  const roomExists = await Room.findOne({
    name: request.body.name,
    creator: request.session.userId,
  });

  if (roomExists)
    return response.status(400).send({ message: "Room already exists." });

  var shortId;
  var roomSameShortId;
  while (true) {
    shortId = `${characters.random(6)}`;
    roomSameShortId = await Room.findOne({ shortId });
    if (!roomSameShortId) break;
  }

  const url = `/room/${shortId}`;

  const room = new Room({
    name: request.body.name,
    creator: request.session.userId,
    members: [{ userId: request.session.userId }],
    shortId,
    url,
  });

  try {
    await room.save();
  } catch (error) {
    return response.status(400).send({ message: "Cannot save room.", error });
  }

  response.send({
    message: "success",
    // redirect: `http://teamlistener.com/room/${room._id}`,
  });
  console.debug(`New room ${request.body.name}`);
});

module.exports = router;
