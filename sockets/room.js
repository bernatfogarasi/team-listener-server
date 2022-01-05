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
  next();
};

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

const getCurrent = (room) =>
  room.current.toObject()
    ? {
        id: room.current.id,
        site: room.current.site,
        title: room.current.title,
        author: room.current.author,
        url: room.current.url,
        thumbnailUrl: room.current.thumbnailUrl,
      }
    : null;

const getPlaying = (room) => room.playing;

const getRequests = async (room) => {
  const requests = await Promise.all(
    room.requests.map(async (request, index) => {
      const user = await User.findOne({ _id: request.userId });
      if (user) return { username: user.username, date: request.date };
    })
  );
  return requests.filter((request) => request);
};

const getMembers = async (room) => {
  const members = await Promise.all(
    room.members.map(async (member) => {
      const user = await User.findOne({ _id: member.userId });
      if (user)
        return {
          username: user.username,
          _id: member._id,
          active: member.active,
        };
    })
  );
  return members.filter((member) => member);
};
const sockets = (io) => {
  io.use(authenticate);
  io.use(checkMembership);

  io.on("connection", async (socket) => {
    const userId = socket.request.session.userId;
    const shortId = socket.handshake.query.shortId;
    console.log("CONNECT", shortId, userId);

    await socket.join(shortId);

    const room = await Room.findOne({ shortId });

    room.members.find(
      (member) => member.userId.toString() === userId
    ).active = true;

    await room.save();

    io.to(shortId).emit("queue", getQueue(room));
    io.to(shortId).emit("current", getCurrent(room));
    io.to(shortId).emit("playing", getPlaying(room));
    io.to(shortId).emit("progress", room.progress);
    io.to(shortId).emit("requests", await getRequests(room));
    io.to(shortId).emit("members", await getMembers(room));
    io.to(shortId).emit("name", room.name);

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
        if (from === null && to === null && room.current.toObject())
          room.queue.push(data);
        if (from === null && to === null && !room.current.toObject())
          room.current = data;
        if (from !== null && to === null)
          array.move(room.queue, from, room.queue.length - 1);
        if (from === null && to !== null) room.queue.splice(to, 0, data);
        if (from !== null && to !== null) array.move(room.queue, from, to);
        await room.save();

        io.to(shortId).emit("queue", getQueue(room));
        io.to(shortId).emit("current", getCurrent(room));
      }
    );

    socket.on(
      "request-current",
      async ({ id, site, title, author, url, thumbnailUrl }, from) => {
        const room = await Room.findOne({ shortId });
        if (typeof from === "number") room.queue.splice(from, 1);
        room.current = { id, site, title, author, url, thumbnailUrl };
        room.progress = 0;
        await room.save();

        io.to(shortId).emit("current", getCurrent(room));
        io.to(shortId).emit("queue", getQueue(room));
        io.to(shortId).emit("progress", room.progress);
      }
    );

    socket.on("request-playing", async (playing) => {
      const room = await Room.findOne({ shortId });
      room.playing = playing;
      await room.save();
      io.to(shortId).emit("playing", getPlaying(room));
    });

    socket.on("request-remove", async (index) => {
      console.log(index);
      const room = await Room.findOne({ shortId });
      if (index >= 0) room.queue.splice(index, 1);
      else if (room.queue.length) room.current = room.queue.splice(0, 1)[0];
      else {
        room.current = null;
        room.playing = false;
        room.seconds = 0;
      }

      await room.save();

      io.to(shortId).emit("current", getCurrent(room));
      io.to(shortId).emit("queue", getQueue(room));
      io.to(shortId).emit("playing", getPlaying(room));
    });

    socket.on("request-progress", async (fraction) => {
      const room = await Room.findOne({ shortId });
      room.progress = fraction;
      await room.save();
      io.to(shortId).emit("progress", room.progress);
    });

    socket.on("request-requests", async () => {
      const room = await Room.findOne({ shortId });
      io.to(shortId).emit("requests", await getRequests(room));
    });

    socket.on("request-accept", async (index) => {
      const room = await Room.findOne({ shortId });
      const { userId } = room.requests[index];
      room.members.push({ userId });
      room.requests.splice(index, 1);
      await room.save();
      io.to(shortId).emit("members", await getMembers(room));
      io.to(shortId).emit("requests", await getRequests(room));
    });

    socket.on("disconnect", async () => {
      const room = await Room.findOne({ shortId });
      room.members.find(
        (member) => member.userId.toString() === userId
      ).active = false;
      if (!room.members.filter((member) => member.active).length)
        room.playing = false;
      await room.save();
      io.to(shortId).emit("playing", getPlaying(room));
      io.to(shortId).emit("members", await getMembers(room));
      console.log("DISCONNECT");
    });
  });
};

module.exports = sockets;
