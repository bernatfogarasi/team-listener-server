require("dotenv").config();
const path = require("path");
const router = require("express").Router();
const Room = require(path.resolve("models/Room"));
const authenticate = require(path.resolve("middleware/authenticate"));

router.get("/", authenticate, async (request, response) => {
  const shortId = request.query.shortId;
  if (!shortId)
    return response
      .status(400)
      .send({ message: "missing parameter 'shortId'" });
  const room = await Room.findOne({ shortId });
  if (!room) return response.status(404).send({ message: "room not found" });
  const info = { name: room.name, memberCount: room.members.length };
  if (
    room.requests
      .map(({ userId }) => userId.toString())
      .includes(request.session.userId)
  )
    return response.status(403).send({ message: "not member waiting", info });
  if (
    !room.members
      .map(({ userId }) => userId.toString())
      .includes(request.session.userId)
  )
    return response.status(403).send({ message: "not member", info });
  response.send({ message: "success" });
});

module.exports = router;
