const path = require("path");
const User = require(path.resolve("models/User"));
const Room = require(path.resolve("models/Room"));
const mongoose = require("mongoose");

const authenticate = async (socket, next) => {
  const session = socket?.request?.session;
  if (!session) return socket.emit("message", "session not found");
  const { userId } = session;
  if (!userId) return socket.emit("message", "session.userId not found");
  const user = await User.findOne({ _id: userId });
  if (!user) socket.emit("message", "user not found");
  session.connections++;
  next();
};

var connections = {};

const sockets = (io) => {
  io.use((socket, next) => {
    const { id } = socket;
    console.log("SOCKET:", id);
    next();
  });

  io.use(authenticate);

  io.on("connection", (socket) => {
    userId = socket.request.session.userId;
    userId in connections
      ? (connections[userId].socketId = socket.id)
      : (connections[userId] = { socketId: socket.id });
    console.log(connections);

    socket.on("join-room", async (shortId) => {
      const room = await Room.findOne({ shortId });
      if (!room) return socket.emit("message", "room not found");
      const memberIds = room.members.map(({ userId }) => userId.toString());
      if (!memberIds.includes(socket.request.session.userId))
        return socket.emit("message", "not member");
      socket.join(shortId);
      socket.emit("message", "joined");
    });
  });
};

module.exports = sockets;
