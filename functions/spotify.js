require("dotenv").config();
const SpotifyWebApi = require("spotify-web-api-node");

const getSpotifyApi = (request) => {
  const credentials = {
    clientId: "f791df7f17f84cd69dc57dd991a5dd33",
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: request.header("origin") + "/",
  };
  const spotifyApi = new SpotifyWebApi(credentials);
  const refreshToken = request?.user?.spotifyRefreshToken;
  if (refreshToken) spotifyApi.setRefreshToken(refreshToken);
  return spotifyApi;
};

module.exports = { getSpotifyApi };
