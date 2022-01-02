const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config();
const router = require("express").Router();
const User = require(path.resolve("models/User"));
const { loginValidation } = require(path.resolve("validation"));

router.post("/", async (request, response) => {
  const { error } = loginValidation(request.body);
  if (error)
    return response.status(400).send({
      message: "not valid",
      error: error.details[0].message,
    });

  const user = await User.findOne({ email: request.body.email });
  if (!user) return response.status(400).send({ message: "user not found" });
  const validPassword = await bcrypt.compare(
    request.body.password,
    user.password
  );
  if (!validPassword)
    return response.status(400).send({ message: "password not valid" });

  request.session.isAuth = true;
  request.session.userId = user._id;
  response.send({ message: "success" });
  console.log(request.session.id);
});

module.exports = router;
