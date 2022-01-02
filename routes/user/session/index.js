const path = require("path");
const authenticate = require(path.resolve("middleware/authenticate"));
const router = require("express").Router();
const User = require(path.resolve("models/User"));
const Room = require(path.resolve("models/Room"));

router.get("/", authenticate, async (request, response) => {
  const { userId } = request.session;
  const user = await User.findOne({ _id: userId });
  const rooms = await Room.find({ "members.userId": userId });
  response.send({
    message: "success",
    data: {
      email: user.email,
      username: user.username,
      rooms: rooms.map(({ name, url }) => ({ name, url })),
      profilePicture: user.profilePicture,
    },
  });
});

module.exports = router;
