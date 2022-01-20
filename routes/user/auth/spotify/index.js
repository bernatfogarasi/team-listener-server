require("dotenv").config();
const path = require("path");
const router = require("express").Router();
const { User } = require(path.resolve("models"));
const { validate } = require(path.resolve("middleware"));
const {
  spotify: { getSpotifyApi },
  characters: { getEmailConfirmationToken },
} = require(path.resolve("functions"));

router.post("/", validate.authSpotify, async (request, response) => {
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

  const userSession = await User.findOne({ _id: request.session?.userId });
  const userSpotify = await User.findOne({ spotifyId: id });

  if (userSession === userSpotify)
    return response.status(400).send({ message: "spotify already linked" });
  if (userSession && userSpotify)
    return response
      .status(400)
      .send({ message: "spotify already linked to different user" });
  if (userSession) {
    userSession.spotifyId = id;
    userSession.spotifyEmail = email;
    userSession.spotifyRefreshToken = refreshToken;
    userSession.save();
    return response.send({ message: "success" });
  }
  let user;
  if (userSpotify) user = userSpotify;
  else {
    const emailConfirmationToken = getEmailConfirmationToken();
    const userNew = new User({
      username: display_name,
      emailConfirmationToken,
      spotifyId: id,
      spotifyEmail: email,
      spotifyRefreshToken: refreshToken,
      profilePicture: { url: images[0].url },
    });
    try {
      user = await userNew.save();
    } catch (error) {
      console.log(error);
      return response.status(400).send({ message: "cannot save user", error });
    }
  }

  request.session.isAuth = true;
  request.session.userId = user._id;

  response.send({ message: "success" });
});

module.exports = router;
