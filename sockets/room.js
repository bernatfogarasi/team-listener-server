const path = require("path");
const User = require(path.resolve("models/User"));
const Room = require(path.resolve("models/Room"));
const mongoose = require("mongoose");
const array = require(path.resolve("functions/array"));

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
  socket.emit("message", "success");
  next();
};

var connections = {};

const getQueue = (room) => {
  return room.queue.map((item) => ({
    _id: item._id.toString(),
    id: item.id,
    site: item.site,
    title: item.title,
    author: item.author,
    url: item.url,
    thumbnailUrl: item.thumbnailUrl,
  }));
};

const getCurrent = (room) => ({
  id: room.current.id,
  site: room.current.site,
  title: room.current.title,
  author: room.current.author,
  url: room.current.url,
  thumbnailUrl: room.current.thumbnailUrl,
});

const getPlaying = (room) => room.playing;

const sockets = (io) => {
  io.use(authenticate);
  io.use(checkMembership);

  io.on("connection", async (socket) => {
    const userId = socket.request.session.userId;
    const shortId = socket.handshake.query.shortId;
    console.log("CONNECT", userId, shortId);

    await socket.join(shortId);

    const room = await Room.findOne({ shortId });

    io.to(shortId).emit("queue", getQueue(room));

    io.to(shortId).emit("current", getCurrent(room));

    socket.on(
      "request-queue",
      async ({ id, site, title, author, url, thumbnailUrl }, from, to) => {
        console.log(from, to);
        const data = {
          id,
          site,
          title,
          author,
          url,
          thumbnailUrl,
          userId,
        };
        let room = await Room.findOne({ shortId });
        if (from === null && to === null) room.queue.push(data);
        if (from !== null && to === null)
          array.move(room.queue, from, room.queue.length - 1);
        if (from === null && to !== null) room.queue.splice(to, 0, data);
        if (from !== null && to !== null) array.move(room.queue, from, to);
        await room.save();

        io.to(shortId).emit("queue", getQueue(room));
      }
    );

    socket.on(
      "request-current",
      async ({ id, site, title, author, url, thumbnailUrl }, from) => {
        const room = await Room.findOne({ shortId });
        console.log(typeof from);
        if (typeof from === "number") room.queue.splice(from, 1);
        room.current = { id, site, title, author, url, thumbnailUrl };
        await room.save();

        io.to(shortId).emit("current", getCurrent(room));
        io.to(shortId).emit("queue", getQueue(room));
      }
    );

    socket.on("request-playing", async (playing) => {
      const room = await Room.findOne({ shortId });
      room.playing = playing;
      await room.save();
      io.to(shortId).emit("playing", getPlaying(room));
    });

    socket.on("disconnect", () => {
      console.log("DISCONNECT");
    });

    socket.on("request-remove", async (index) => {
      const room = await Room.findOne({ shortId });
      room.queue.splice(index, 1);
      await room.save();
      io.to(shortId).emit("queue", getQueue(room));
    });
  });
};

module.exports = sockets;
