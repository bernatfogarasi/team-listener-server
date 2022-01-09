require("dotenv").config();
const path = require("path");
const {
  spotify: { getSpotifyApi },
} = require(path.resolve("functions"));
const router = require("express").Router();
const { authenticate } = require(path.resolve("middleware"));

router.get("/", authenticate, async (request, response) => {
  const spotifyApi = await getSpotifyApi(request);
  try {
    const accessToken = spotifyApi.getAccessToken();
    return response.send({ message: "success", data: { accessToken } });
  } catch (error) {
    return response.status(401).send({ message: "no refresh token", error });
  }
});

module.exports = router;
