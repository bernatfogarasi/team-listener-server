require("dotenv").config();
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const router = require("express").Router();
const User = require(path.resolve("models/User"));
const { registerValidation } = require(path.resolve("validation"));

router.post("/", async (request, response) => {
  console.debug(`New room [attempt] ${request.body.email}`);
  const { error } = registerValidation(request.body);
  if (error)
    return response.status(400).send({
      message: "Registration is not valid",
      error: error.details[0].message,
    });

  const emailExists = await User.findOne({ email: request.body.email });
  if (emailExists)
    return response
      .status(400)
      .send({ message: "Email already exists, please log in." });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(request.body.password, salt);

  const user = new User({
    username: request.body.username,
    email: request.body.email,
    password: hashedPassword,
    emailConfirmationToken,
  });
  try {
    const savedUser = await user.save();
  } catch (error) {
    return response.status(400).send({ message: "Cannot save user.", error });
  }

  const url = `http://${request.get(
    "host"
  )}/user/confirm?token=${emailConfirmationToken}`;

  emailTransport.sendMail(
    {
      from: { name: "TeamListener", address: "teamlistener@gmail.com" },
      to: request.body.email,
      subject: "Please confirm your email address",
      // html: `Please click <a href="http://${request.get(
      //   "host"
      // )}/user/confirm?token=${emailConfirmationToken}">here</a> to verify your email address.`,
      html: emailHtml,
    },
    (error, info) => {
      if (error) {
        return response
          .status(500)
          .send({ message: "Cannot send verification email.", error });
      } else {
        console.debug(
          `Confirmation email sent [success] ${request.body.email}`
        );
      }
    }
  );
  response.send({ message: "success" });
  console.debug(`Registration [success] ${request.body.email}`);
});

module.exports = router;
