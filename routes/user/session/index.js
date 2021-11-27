const path = require("path");
const router = require("express").Router();
const User = require(path.resolve("models/User"));

router.get("/", async (request, response) => {
  if (!request.cookies) return response.status(400).send("cookies not found");
  if (!request.session.userId)
    return response.status(404).send({ message: "session not found" });
  const user = await User.findOne({ _id: request.session.userId });
  if (!user) return response.status(404).send({ message: "user not found" });
  response.send({
    message: "success",
    data: { email: user.email, name: user.username },
  });
});

module.exports = router;
