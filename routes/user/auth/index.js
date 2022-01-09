const router = require("express").Router();

router.use("/google", require("./google"));
router.use("/manual", require("./manual"));
router.use("/spotify", require("./spotify"));
router.use("/spotify-access-token", require("./spotify-access-token"));

module.exports = router;
