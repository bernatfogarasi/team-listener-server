const path = require("path");
const { authenticate } = require(path.resolve("middleware"));
const router = require("express").Router();

router.post("/", authenticate, async (request, response) => {
  const file = request.files?.file;
  if (!file) return response.status(400).send({ message: "file not found" });
  const { user } = request;
  user.profilePicture = {
    data: request.files.file.data,
    contentType: request.files.file.mimetype,
  };
  await user.save();
  return response.send({ message: "success" });
});

module.exports = router;
