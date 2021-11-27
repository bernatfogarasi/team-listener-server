const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config();
const router = require("express").Router();
const User = require(path.resolve("models/User"));
const { loginValidation } = require(path.resolve("validation"));

router.post("/", async (request, response) => {
  console.debug("Login [attempt]");
  const { error } = loginValidation(request.body);
  if (error)
    return response.status(400).send({
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

  request.session.isAuth = true;
  request.session.userId = user._id;
  response.send({
    message: "success",
    data: { name: user.name, email: user.email },
  });
  console.debug(`Login [success] ${request.body.email}`);
  console.log(request.session.id);
});

module.exports = router;
