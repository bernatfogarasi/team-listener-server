const path = require("path");
require("dotenv").config();
const router = require("express").Router();
const { User } = require(path.resolve("models"));

router.get("/", async (request, response) => {
  console.debug(`Confirmation [attempt]`);
  // const token = request.header("token");
  const token = await request.query.token;

  if (!token)
    return response
      .status(401)
      .send({ message: "Verification token not specified." });

  const query = { emailConfirmationToken: token };
  const update = { emailConfirmed: true };
  User.findOneAndUpdate(query, update, {}, (error, document) => {
    if (error)
      return response
        .status(500)
        .send({ message: "Cannot search for email token.", error });
    if (!document)
      return response
        .status(404)
        .redirect(
          `${process.env.CLIENT_ORIGIN}/signup/confirmation/token-not-found`
        );

    if (document.emailConfirmed)
      return response
        .status(400)
        .redirect(
          `${process.env.CLIENT_ORIGIN}/signup/confirmation/email-already-verified`
        );

    response.redirect(
      `${process.env.CLIENT_ORIGIN}/signup/confirmation/success`
    );
    console.debug(`Confirmation [success]`);
  });
});

module.exports = router;
