const path = require("path");
const router = require("express").Router();

router.get("/", async (request, response) => {
  return response.send({ message: "success" });
});

module.exports = router;
