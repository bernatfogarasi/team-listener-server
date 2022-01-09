const router = require("express").Router();

router.use("/get", require("./get"));
router.use("/new", require("./new"));
router.use("/request", require("./request"));

module.exports = router;
