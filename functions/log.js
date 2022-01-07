const debug = (title, ...parameters) => {
  console.log("\u001b[1;33m" + "ROOM", title + "\u001b[0m", ...parameters);
};

const test = (...sections) => {
  console.log("\u001b[1;34m" + "TEST" + "\u001b[0m", ...sections);
};

const changes = (...sections) => {
  console.log("\u001b[1;32m" + "CHANGES" + "\u001b[0m", ...sections);
};

const emit = (...sections) => {
  console.log("\u001b[1;44m" + "EMIT", ...sections, "\u001b[0m");
};

const request = (...sections) => {
  console.log("\u001b[1;34m" + "REQUEST", ...sections, "\u001b[0m");
};

module.exports = { debug, test, changes, emit, request };
