require("dotenv").config();
const path = require("path");
const { getSpotifyApi } = require(path.resolve("functions/spotify"));
const router = require("express").Router();
const User = require(path.resolve("models/User"));
const { authSpotifyValidation } = require(path.resolve("validation"));
const { getEmailConfirmationToken } = require(path.resolve(
  "functions/characters"
));

router.post("/", async (request, response) => {
  const { error } = authSpotifyValidation(request.body);
  if (error)
    return response.status(400).send({
      message: "not valid",
      error: error?.details[0].message,
    });
  const { code } = request.body;

  const spotifyApi = await getSpotifyApi(request);

  let authData;
  try {
    authData = await spotifyApi.authorizationCodeGrant(code);
  } catch (error) {
    console.log("spotify api auth fail");
  }
  if (!authData)
    return response.status(400).send({ message: "spotify api auth fail" });
  const {
    access_token: accessToken,
    refresh_token: refreshToken,
    scope,
  } = authData.body;

  spotifyApi.setAccessToken(accessToken);
  const me = await spotifyApi.getMe();
  const { email, display_name, id, images } = me.body;

  const user = await User.findOne({ email });
  var userId;
  if (user) {
    userId = user._id;
  } else {
    const emailConfirmationToken = getEmailConfirmationToken();
    const user = new User({
      username: display_name,
      email,
      emailConfirmationToken,
      spotifyRefreshToken: refreshToken,
      profilePicture: { url: images[0].url },
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
