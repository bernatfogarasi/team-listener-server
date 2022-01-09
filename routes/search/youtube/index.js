const path = require("path");
const router = require("express").Router();
const fetch = require("node-fetch");
const { validate, authenticate } = require(path.resolve("middleware"));

router.post("/", [validate.search, authenticate], async (request, response) => {
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
    if (!video?.videoRenderer) return;
    const data = video.videoRenderer;
    if (!data?.lengthText?.simpleText) return;
    let result = {
      site: "youtube",
      id: data.videoId,
      title: data.title.runs[0].text,
      thumbnailUrl: data.thumbnail.thumbnails.slice(-1)[0].url,
      author: data.ownerText.runs[0].text,
      duration: data.lengthText.simpleText
        .split(":")
        .reverse()
        .map((item, index) => item * Math.pow(60, index) * 1000)
        .reduce((a, b) => a + b, 0),
      // channel: {
      //   title: data.ownerText.runs[0].text,
      //   id: data.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId,
      //   thumbnail:
      //     data.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails.slice(
      //       -1
      //     )[0].url,
      // },
    };
    result.url = `https://www.youtube.com/watch?v=${result.id}`;
    // result.channel.url = `https://www.youtube.com/channel/${result.channel.id}`;
    return result;
  };

  const fetchResponse = await fetch(
    `https://www.youtube.com/results?search_query=${request.body.text}&sp=EgIQAQ%253D%253D`
  );
  try {
    const html = await fetchResponse.text();
    const json = getJsonFromHtml(html);
    const videos = getVideosFromJson(json);
    const results = videos.map(formatVideoInfo).filter((item) => item);
    response.send({ message: "success", data: results });
  } catch (error) {
    return response.status(400).send({ message: "Cannot fetch.", error });
  }
});

module.exports = router;
