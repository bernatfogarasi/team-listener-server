const path = require("path");
const router = require("express").Router();
const { searchValidation } = require(path.resolve("validation"));
const fetch = require("node-fetch");
const authenticate = require(path.resolve("middleware/authenticate"));
const { getSpotifyApi } = require(path.resolve("functions/spotify"));

router.post("/", authenticate, async (request, response) => {
  const { error } = searchValidation(request.body);
  if (error)
    return response
      .status(400)
      .send({ message: "not valid", error: error.details[0].message });

  if (!request.user.spotifyRefreshToken)
    return response.send({ message: "refresh token not found" });

  const spotifyApi = getSpotifyApi(request);

  response.send({ message: "success", data: results });
});

module.exports = router;
