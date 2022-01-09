const path = require("path");
const { authenticate } = require(path.resolve("middleware"));
const router = require("express").Router();
const { Room, User } = require(path.resolve("models"));

const getMembers = async (membersOriginal) => {
  const members = await Promise.all(
    membersOriginal.map(async (member) => {
      const user = await User.findOne({ _id: member.userId });
      if (user)
        return {
          username: user.username,
          _id: member._id,
          active: member.active,
          profilePicture: user.profilePicture,
        };
    })
  );
  return members.filter((member) => member);
};

const getRooms = (rooms) =>
  Promise.all(
    rooms.map(async ({ name, url, members, playing }) => ({
      name,
      url,
      members: await getMembers(members),
      playing,
    }))
  );

router.get("/", authenticate, async (request, response) => {
  const { userId } = request.session;
  const user = await User.findOne({ _id: userId });
  const rooms = await Room.find({ "members.userId": userId });
  response.send({
    message: "success",
    data: {
      email: user.email,
      username: user.username,
      rooms: await getRooms(rooms),
      profilePicture: user.profilePicture,
    },
  });
});

module.exports = router;
