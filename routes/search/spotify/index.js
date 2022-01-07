const path = require("path");
const router = require("express").Router();
const { searchValidation } = require(path.resolve("validation"));
const authenticate = require(path.resolve("middleware/authenticate"));
const { getSpotifyApi } = require(path.resolve("functions/spotify"));
const log = require(path.resolve("functions/log"));

router.post("/", authenticate, async (request, response) => {
  const { error } = searchValidation(request.body);
  if (error)
    return response
      .status(400)
      .send({ message: "not valid", error: error.details[0].message });
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
      // channel: {
      //   title: data.ownerText.runs[0].text,
      //   id: data.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId,
      //   thumbnail:
      //     data.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails.slice(
      //       -1
      //     )[0].url,
      // },
    };
    return result;
  });

  response.send({ message: "success", data: results });
});

module.exports = router;
