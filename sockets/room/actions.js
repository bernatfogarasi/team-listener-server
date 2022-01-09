const path = require("path");
const extract = require("./extract");
const { Room } = require(path.resolve("models"));
const { array, log } = require(path.resolve("functions"));

const actions = async (io, socket, userId, shortId, room) => {
  const getRoom = async () => {
    const room = await Room.findOne({ shortId });
    return room;
  };

  const saveRoom = async (room) => {
    log.changes(room.getChanges());
    room = await room.save();
    return room;
  };

  const emit = {
    queue: (room) => io.to(shortId).emit("queue", extract.extractQueue(room)),
    current: (room) =>
      io.to(shortId).emit("current", extract.extractCurrent(room)),
    playing: (room) =>
      io.to(shortId).emit("playing", extract.extractPlaying(room)),
    progress: (room) =>
      io.to(shortId).emit("progress", extract.extractProgress(room)),
    requests: async (room) =>
      await io
        .to(shortId)
        .emit("requests", await extract.extractRequests(room)),
    members: async (room) =>
      await io.to(shortId).emit("members", await extract.extractMembers(room)),
    name: (room) => io.to(shortId).emit("name", extract.extractName(room)),
  };

  const emitAll = async (room) => {
    Object.values(emit).map(async (func) => await func(room));
  };

  await emitAll(room);

  const requestPlaying = async (playing) => {
    let room = await getRoom();
    log.debug("request-playing", playing);
    room.playing = playing;
    room = await saveRoom(room);
    emit.playing(room);
  };

  const requestProgress = async (progress) => {
    let room = await getRoom();
    log.debug("request-progress", progress);
    room.progress = progress;
    room = await saveRoom(room);
    emit.progress(room);
  };

  const requestRemove = async (index) => {
    let room = await getRoom();
    log.debug("request-remove", index);
    room.queue.splice(index, 1);
    room = await saveRoom(room);
    emit.queue(room);
  };

  const requestCurrent = async (content, index) => {
    log.debug("request-current", content?.title);
    await requestPlaying(Boolean(content?.id));
    await requestProgress(0);
    await requestRemove(index);
    let room = await getRoom();
    room.current = content;
    room = await saveRoom(room);
    emit.current(room);
  };

  const requestNext = async () => {
    let room = await getRoom();
    log.debug("request-next");
    await requestCurrent(room.queue[0]);
    await requestRemove(0);
  };

  const requestFill = async (content) => {
    let room = await getRoom();
    log.debug("request-fill");
    if (room.current?.id) return;
    await requestCurrent(content);
    return true;
  };

  const requestInsert = async (content, index) => {
    log.debug("request-insert", index);
    if (await requestFill(content)) return;
    let room = await getRoom();
    index = Number.isInteger(index) ? index : room.queue.length;
    room.queue.splice(index, 0, { userId, ...content });
    room = await saveRoom(room);
    emit.queue(room);
  };

  const requestMove = async (indexFrom, indexTo) => {
    let room = await getRoom();
    log.debug("request-move", indexFrom, indexTo);
    if (indexTo === "current") {
      await requestCurrent(room.queue[indexFrom]);
      await requestRemove(indexFrom);
    } else {
      indexTo = Number.isInteger(indexTo) ? indexTo : room.queue.length;
      array.move(room.queue, indexFrom, indexTo);
      room = await saveRoom(room);
      emit.queue(room);
    }
  };

  const requestMemberInsert = async (userId, index) => {
    let room = await getRoom();
    log.debug("request-member-insert", index);
    index = index || room.members.length;
    room.members.splice(index, 0, { userId });
    room = await saveRoom(room);
    await emit.members(room);
  };

  const requestMemberRemove = async (index) => {
    let room = await getRoom();
    log.debug("request-member-accept", index);
    room.members.splice(index, 1);
    room = await saveRoom(room);
    await emit.members(room);
  };

  const requestRequestRemove = async (index) => {
    let room = await getRoom();
    log.debug("request-request-remove", index);
    room.requests.splice(index, 1);
    room = await saveRoom(room);
    await emit.requests(room);
  };

  const requestRequestAccept = async (index) => {
    let room = await getRoom();
    log.debug("request-request-accept", index);
    const { userId } = room.requests[index];
    await requestMemberInsert(userId);
    await requestRequestRemove(index);
  };

  const requestAbandon = async () => {
    let room = await getRoom();
    log.debug("request-abandon");
    if (room.members.filter((member) => member.active).length) return;
    await requestPlaying(false);
  };

  const requestActive = async (active) => {
    let room = await getRoom();
    log.debug("request-active", active);
    room.members.find(
      (member) => member.userId.toString() === userId
    ).active = false;
    room = await saveRoom(room);
    await emit.members(room);
  };

  const disconnect = async () => {
    log.debug("disconnect");
    socket.leave(shortId);
    await requestAbandon();
    await requestActive(false);
  };

  socket.on("request-playing", requestPlaying);
  socket.on("request-progress", requestProgress);
  socket.on("request-current", requestCurrent);
  socket.on("request-remove", requestRemove);
  socket.on("request-move", requestMove);
  socket.on("request-next", requestNext);
  socket.on("request-fill", requestFill);
  socket.on("request-insert", requestInsert);
  socket.on("request-member-insert", requestMemberInsert);
  socket.on("request-member-remove", requestMemberRemove);
  socket.on("request-request-accept", requestRequestAccept);
  socket.on("request-request-remove", requestRequestRemove);
  socket.on("disconnect", disconnect);
};

module.exports = actions;
