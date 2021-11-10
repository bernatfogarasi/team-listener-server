const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const authRoute = require("./routes/auth");

dotenv.config();

mongoose.connect(
  process.env.DATABASE_CREDENTIALS,
  { useNewUrlParser: true },
  (error) => console.log(error ? error : "Connected to database.")
);

app.use(express.json());

app.use("/user", authRoute);

app.listen(3000, () => console.log("Server is running..."));
