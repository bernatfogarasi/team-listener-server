const path = require("path");
const authenticate = require(path.resolve("middleware/authenticate"));
const router = require("express").Router();
const User = require(path.resolve("models/User"));
const Room = require(path.resolve("models/Room"));

router.get("/", authenticate, async (request, response) => {
  const user = await User.findOne({ _id: request.session.userId });
  const rooms = await Room.find({ creator: request.session.userId });
  response.send({
    message: "success",
    data: {
      email: user.email,
      username: user.username,
      rooms: rooms.map(({ name, url }) => ({ name, url })),
    },
  });
});

module.exports = router;
