const path = require("path");
const { User } = require(path.resolve("models"));

const authenticate = async (request, response, next) => {
  if (!request.cookies)
    return response.status(400).send({ message: "cookies not found" });
  if (!request.session.userId)
    return response.status(404).send({ message: "session not found" });
  const user = await User.findOne({ _id: request.session.userId });
  if (!user) return response.status(404).send({ message: "user not found" });
  request.user = user;
  next();
};

module.exports = authenticate;
