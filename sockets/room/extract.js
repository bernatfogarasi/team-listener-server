const path = require("path");
const { User } = require(path.resolve("models"));
const { log } = require(path.resolve("functions"));

const extractQueue = (room) => {
  const queue = room.queue.map((item) => ({
    _id: item._id.toString(),
    id: item.id,
    site: item.site,
    title: item.title,
    author: item.author,
    duration: item.duration,
    url: item.url,
    thumbnailUrl: item.thumbnailUrl,
  }));
  log.emit("queue", queue);
  return queue;
};

const extractCurrent = (room) => {
  const current = room.current?.toObject()
    ? {
        id: room.current.id,
        site: room.current.site,
        title: room.current.title,
        author: room.current.author,
        duration: room.current.duration,
        url: room.current.url,
        thumbnailUrl: room.current.thumbnailUrl,
      }
    : null;
  log.emit("current", current);
  return current;
};

const extractPlaying = (room) => {
  const playing = room.playing;
  log.emit("playing", playing);
  return playing;
};

const extractRequests = async (room) => {
  let requests = await Promise.all(
    room.requests.map(async (request, index) => {
      const user = await User.findOne({ _id: request.userId });
      if (user) return { username: user.username, date: request.date };
    })
  );
  requests = requests.filter((request) => request);
  log.emit("requests", requests);
  return requests;
};

const extractMembers = async (room) => {
  let members = await Promise.all(
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
  members = members.filter((member) => member);
  log.emit("members", members);
  return members;
};

const extractName = (room) => {
  const name = room.name;
  log.emit("name", name);
  return name;
};

const extractProgress = (room) => {
  const progress = room.progress;
  log.emit("progress", progress);
  return progress;
};

module.exports = {
  extractQueue,
  extractCurrent,
  extractPlaying,
  extractRequests,
  extractMembers,
  extractName,
  extractProgress,
};
