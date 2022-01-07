const router = require("express").Router();

router.use("/google", require("./google"));
router.use("/spotify", require("./spotify"));
router.use("/spotify-access-token", require("./spotify-access-token"));

module.exports = router;
