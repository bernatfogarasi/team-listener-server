const router = require("express").Router();

router.use("/get", require("./get"));
router.use("/new", require("./new"));

module.exports = router;
