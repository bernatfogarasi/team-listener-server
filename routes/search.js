const router = require("express").Router();
const { searchValidation } = require("../validation");
const fetch = require("node-fetch");

router.post("/youtube", async (request, response) => {
  const { error } = searchValidation(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  const getJsonFromHtml = (html) => {
    const startText = "var ytInitialData = ";
    const endText = "</script>";
    reducedHtml = html.slice(html.indexOf(startText) + startText.length);
    jsonText = reducedHtml.slice(0, reducedHtml.indexOf(endText) - 1);
    const json = JSON.parse(jsonText);
    return json;
  };

  const getVideosFromJson = (json) => {
    const videos =
      json.contents.twoColumnSearchResultsRenderer.primaryContents
        .sectionListRenderer.contents[0].itemSectionRenderer.contents;
    return videos;
  };

  const formatVideoInfo = (video) => {
    const data = video?.videoRenderer;
    let result = {
      id: data.videoId,
      title: data.title.runs[0].text,
      thumbnail: data.thumbnail.thumbnails.slice(-1)[0].url,
      channel: {
        title: data.ownerText.runs[0].text,
        id: data.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId,
        thumbnail:
          data.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails.slice(
            -1
          )[0].url,
      },
    };
    result.url = `https://www.youtube.com/watch?v=${result.id}`;
    result.channel.url = `https://www.youtube.com/channel/${result.channel.id}`;
    return result;
  };

  const fetchResponse = await fetch(
    `https://www.youtube.com/results?search_query=${request.body.text}&sp=EgIQAQ%253D%253D`
  );
  try {
    const html = await fetchResponse.text();
    const json = getJsonFromHtml(html);
    const videos = getVideosFromJson(json);
    const results = videos.map(formatVideoInfo);
    response.send(results);
  } catch (error) {
    return response.status(400).send(error);
  }
});

module.exports = router;
