const router = require("express").Router();
const User = require("../models/User");
const { registerValidation, loginValidation } = require("../validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", async (request, response) => {
  const { error } = registerValidation(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  const emailExists = await User.findOne({ email: request.body.email });
  if (emailExists)
    return response.status(400).send("Email already exists, please log in.");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(request.body.password, salt);

  const user = new User({
    name: request.body.name,
    email: request.body.email,
    password: hashedPassword,
  });
  try {
    const savedUser = await user.save();
    response.send({ user: user._id });
  } catch (error) {
    response.status(400).send(error);
  }
});

router.post("/login", async (request, response) => {
  const { error } = loginValidation(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: request.body.email });
  if (!user)
    return response.status(400).send("Email does not exist, please register.");
  const validPassword = await bcrypt.compare(
    request.body.password,
    user.password
  );
  if (!validPassword) return response.status(400).send("Invalid password");

  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  response.header("auth-token", token).send(token);

  // response.send("Logged in.");
});

module.exports = router;
