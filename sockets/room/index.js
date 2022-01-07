const path = require("path");
const User = require(path.resolve("models/User"));
const Room = require(path.resolve("models/Room"));
const mongoose = require("mongoose");
const array = require(path.resolve("functions/array"));
const log = require(path.resolve("functions/log"));
const actions = require("./actions");

const authenticate = async (socket, next) => {
  const session = socket?.request?.session;
  if (!session) return socket.emit("message", "session not found");
  const { userId } = session;
  if (!userId) return socket.emit("message", "session.userId not found");
  const user = await User.findOne({ _id: userId });
  if (!user) socket.emit("message", "user not found");
  next();
};

const checkMembership = async (socket, next) => {
  const shortId = socket.handshake.query.shortId;
  const room = await Room.findOne({ shortId });
  if (!room) return socket.emit("message", "room not found");
  const memberIds = room.members.map(({ userId }) => userId.toString());
  if (!memberIds.includes(socket.request.session.userId))
    return socket.emit("message", "not member");
  next();
};

const sockets = (io) => {
  io.use(authenticate);
  io.use(checkMembership);

  io.on("connect", async (socket) => {
    log.debug("connect");
    const userId = socket.request.session.userId;
    const shortId = socket.handshake.query.shortId;

    await socket.join(shortId);

    let room = await Room.findOne({ shortId });

    room.members.find(
      (member) => member.userId.toString() === userId
    ).active = true;

    await room.save();

    await actions(io, socket, userId, shortId, room);
  });
};

module.exports = sockets;
