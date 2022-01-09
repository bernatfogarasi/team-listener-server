const path = require("path");
const router = require("express").Router();
const { Room } = require(path.resolve("models"));
const { validate, authenticate } = require(path.resolve("middleware"));

router.post("/", [validate.search, authenticate], async (request, response) => {
  const { text } = request.body;
  const regex = new RegExp(text, "i"); // i: case insensitive
  const rooms = await Room.find({ name: { $regex: regex } });
  return response.send({ message: "success", data: rooms.splice(0, 10) });
});

module.exports = router;
