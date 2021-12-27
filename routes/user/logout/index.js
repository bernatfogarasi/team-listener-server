const path = require("path");
const router = require("express").Router();
const authenticate = require(path.resolve("middleware/authenticate"));

router.get("/", authenticate, async (request, response) => {
  request.session.destroy((error) => {
    if (error)
      return response.status(400).send({ message: "cannot destroy session" });
    return response.send({ message: "success" });
  });
});

module.exports = router;
