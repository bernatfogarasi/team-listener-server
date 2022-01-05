const router = require("express").Router();

router.use("/rooms", require("./rooms"));
router.use("/spotify", require("./spotify"));
router.use("/youtube", require("./youtube"));

module.exports = router;
