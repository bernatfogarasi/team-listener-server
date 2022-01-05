const router = require("express").Router();

router.use("/google", require("./google"));
router.use("/spotify", require("./spotify"));

module.exports = router;
