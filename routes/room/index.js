const router = require("express").Router();

router.use("/accept", require("./request"));
router.use("/new", require("./new"));
router.use("/request", require("./request"));

module.exports = router;
