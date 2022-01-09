require("dotenv").config();
const path = require("path");
const router = require("express").Router();
const { User } = require(path.resolve("models"));
const { validate } = require(path.resolve("middleware"));
const { OAuth2Client } = require("google-auth-library");

const clientId =
  "95200909886-co62p1sehhu134kdvoai53gomdkac4p6.apps.googleusercontent.com";

router.post("/", validate.authGoogle, async (request, response) => {
  const { tokenId } = request.body;

  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken: tokenId,
    audience: process.env.CLIENT_ID,
  });
  const { email, email_verified, picture, given_name } = ticket.getPayload();

  const user = await User.findOne({ email });
  var userId;
  if (user) {
    userId = user._id;
  } else {
    const user = new User({
      username: given_name,
      email,
      emailConfirmed: email_verified,
      profilePicture: { url: picture },
    });

    var userSaved;
    try {
      userSaved = await user.save();
    } catch (error) {
      return response.status(400).send({ message: "cannot save user", error });
    }
    userId = userSaved._id;
  }

  request.session.isAuth = true;
  request.session.userId = userId;

  response.send({ message: "success" });
});

module.exports = router;
