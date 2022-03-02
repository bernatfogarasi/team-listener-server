require("dotenv").config();
const path = require("path");
const router = require("express").Router();
const { Room } = require(path.resolve("models"));
const { validate, authenticate } = require(path.resolve("middleware"));
const { characters } = require(path.resolve("functions"));

router.post(
  "/",
  [validate.newRoom, authenticate],
  async (request, response) => {
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
    });
    console.debug(`New room ${request.body.name}`);
  }
);

module.exports = router;
