require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const fileUpload = require("express-fileupload");
const path = require("path");
const { log } = require(path.resolve("functions"));

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true }, (error) =>
  console.log(error || "Connected to database.")
);

app.use(express.json());

app.use(fileUpload());

app.use((request, response, next) => {
  log.request(request.header("origin"), "->", request.originalUrl);
  log.request(JSON.stringify(request.cookies));
  next();
});

app.use((request, response, next) => {
  const corsWhiteList = [
    "http://teamlistener.com",
    "http://localhost:3000",
    // "http://192.168.1.104:3000",
  ];
  const requestOrigin = request.header("origin");
  if (corsWhiteList.indexOf(requestOrigin) !== -1) {
    response.setHeader("Access-Control-Allow-Origin", requestOrigin);
    // response.setHeader("Access-Control-Allow-Origin", "*");
    // response.setHeader(
    //   "Access-Control-Allow-Methods",
    //   "GET, POST, PATCH, DELETE, OPTIONS"
    // );
    // response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Access-Control-Allow-Credentials", true);
  }

  next();
});

app.use(cookieParser());

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 10,
  },
  resave: true,
  rolling: true,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DATABASE_URL,
  }),
});

app.use(sessionMiddleware);

app.use("/", require("./routes"));

const server = app.listen(process.env.PORT || 4000, () =>
  console.log(`Server started at ${Date()}.`)
);

const io = require("socket.io")(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://teamlistener.com",
      // "http://192.168.1.104:3000",
    ],
    credentials: true,
  },
});
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

require("./sockets/room")(io);

app.io = io;
