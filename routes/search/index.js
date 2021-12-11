const router = require("express").Router();

router.use("/youtube", require("./youtube"));
router.use("/rooms", require("./rooms"));

module.exports = router;
