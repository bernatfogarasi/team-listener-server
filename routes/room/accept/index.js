require("dotenv").config();
const path = require("path");
const router = require("express").Router();
const Room = require(path.resolve("models/Room"));
const authenticate = require(path.resolve("middleware/authenticate"));

router.post("/", authenticate, async (request, response) => {});

module.exports = router;
