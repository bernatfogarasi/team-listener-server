require("dotenv").config();
const router = require("express").Router();
const path = require("path");
const bcrypt = require("bcrypt");
const { User } = require(path.resolve("models"));
const { validate } = require(path.resolve("middleware"));

router.post("/", validate.login, async (request, response) => {
  const user = await User.findOne({ email: request.body.email });
  if (!user) return response.status(400).send({ message: "user not found" });
  if (!user.password)
    return response.status(400).send({ message: "try an other login method" });
  const validPassword = await bcrypt.compare(
    request.body.password,
    user.password
  );
  if (!validPassword)
    return response.status(400).send({ message: "password not valid" });
  request.session.isAuth = true;
  request.session.userId = user._id;
  response.send({ message: "success" });
});

module.exports = router;
