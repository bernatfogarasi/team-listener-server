require("dotenv").config();
const path = require("path");
const bcrypt = require("bcrypt");
const {
  characters: { getEmailConfirmationToken },
  email: { sendConfirmationEmail },
} = require(path.resolve("functions"));
const router = require("express").Router();
const { User } = require(path.resolve("models"));
const { validate } = require(path.resolve("middleware"));

router.post("/", validate.signup, async (request, response) => {
  const { username, email, password } = request.body;

  const emailExists = await User.findOne({ email });
  if (emailExists)
    return response.status(400).send({ message: "email already exists" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const emailConfirmationToken = getEmailConfirmationToken();

  const user = new User({
    username,
    email,
    password: hashedPassword,
    emailConfirmationToken,
  });

  try {
    await user.save();
  } catch (error) {
    return response.status(400).send({ message: "cannot save user", error });
  }

  const { errorEmail } = sendConfirmationEmail(email, emailConfirmationToken);
  if (errorEmail)
    return response
      .status(500)
      .send({ message: "cannot send email", error: errorEmail });

  response.send({ message: "success" });
});

module.exports = router;
