const router = require("express").Router();

router.use("/accept", require("./request"));
router.use("/new", require("./new"));
router.use("/request", require("./request"));
router.use("/get", require("./get"));

module.exports = router;
