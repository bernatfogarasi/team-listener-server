const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const User = require(path.resolve("models/User"));
const { loginValidation } = require(path.resolve("validation"));

router.post("/", async (request, response) => {
  const { error } = loginValidation(request.body);
  if (error)
    return response
      .status(400)
      .send({
        message: "Login is not valid.",
        error: error.details[0].message,
      });

  const user = await User.findOne({ email: request.body.email });
  if (!user)
    return response
      .status(400)
      .send({ message: "Email does not exist, please register." });
  const validPassword = await bcrypt.compare(
    request.body.password,
    user.password
  );
  if (!validPassword)
    return response.status(400).send({ message: "Invalid password" });

  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  response.header("auth-token", token).send({ message: "success", token });
});

module.exports = router;
