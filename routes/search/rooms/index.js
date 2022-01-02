const path = require("path");
const router = require("express").Router();
const { searchValidation } = require(path.resolve("validation"));
const Room = require(path.resolve("models/Room"));
const authenticate = require(path.resolve("middleware/authenticate"));

router.post("/", authenticate, async (request, response) => {
  const { error } = searchValidation(request.body);
  if (error)
    return response
      .status(400)
      .send({ message: "Invalid search.", error: error?.details[0]?.message });
  const { text } = request.body;
  console.log(text);
  const regex = new RegExp(text, "i"); // i: case insensitive
  const rooms = await Room.find({ name: { $regex: regex } });
  return response.send({ message: "success", data: rooms.splice(0, 10) });
});

module.exports = router;
