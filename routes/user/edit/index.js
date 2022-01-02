const router = require("express").Router();

router.use("/profile-picture", require("./profile-picture"));

module.exports = router;
