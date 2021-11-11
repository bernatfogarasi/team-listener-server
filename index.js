const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const authRoute = require("./routes/auth");

const searchRoute = require("./routes/search");

dotenv.config();

mongoose.connect(
  process.env.DATABASE_CREDENTIALS,
  { useNewUrlParser: true },
  (error) => console.log(error ? error : "Connected to database.")
);

app.use(express.json());

app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/user", authRoute);

app.use("/search", searchRoute);

app.listen(process.env.PORT || 4000, () => console.log("Server is running..."));
