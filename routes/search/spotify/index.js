const router = require("express").Router();
const path = require("path");
const { validate, authenticate } = require(path.resolve("middleware"));
const {
  spotify: { getSpotifyApi },
} = require(path.resolve("functions"));

router.post("/", [validate.search, authenticate], async (request, response) => {
  const { text } = request.body;
  if (!request.user.spotifyRefreshToken)
    return response.send({ message: "refresh token not found" });

  const spotifyApi = await getSpotifyApi(request);

  const searchResponse = await spotifyApi.searchTracks(text, { limit: 20 });
  const results = searchResponse.body.tracks.items.map((data) => {
    let result = {
      site: "spotify",
      id: data.id,
      title: data.name,
      thumbnailUrl: data.album.images[1].url,
      author: data.artists.map((artist) => artist.name).join(", "),
      url: data.uri,
      duration: data.duration_ms,
    };
    return result;
  });

  response.send({ message: "success", data: results });
});

module.exports = router;
